// DOM Elements
var APIkey = "b2876219faf576021713429535c2bae1";
var searchInput = "";
var todayCard = $('#today');
var fiveDayForecast = $('#forecast');
var searchHistory = [];
weatherContent = $('weather-content');


// When User clicks Search button, it display results
$("#search-city-button").on('click', function (event) {

    //prevent default action
    event.preventDefault();

    // grab input val & get weather data
    searchInput = $("#search-city").val();
    getWeather();

    // add to buttons to allow users to search for that city again
    addToButtons();

});

// Main Weather Function - GET LON/LAT & Generate Weather
function getWeather() {

    // clear previous searches on screen otherwise it repeats
    todayCard.empty();
    $('#forecast-title').empty();
    fiveDayForecast.empty();

    // Get search value & set URL for geocoding API
    var geoQueryURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + searchInput + "&limit=5&appid=" + APIkey;

    // GET Latitude & Longitude for City
    $.ajax({
        url: geoQueryURL,
        method: "GET"
    }).then(function (response) {

        console.log("Geocoding API Response:", response);

        // get lon/lat, reduce to 2 decimals
        var lon = response[0].lon.toFixed(2);
        var lat = response[0].lat.toFixed(2);
        
        var singleDayDataUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + APIkey;
        var weatherQueryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIkey;

        // Get Weather for Current Day
        $.ajax({
            url: singleDayDataUrl,
            method: "GET"
        }).then(function (response) {
            // console.log(response.city)
            var todayDiv = $('<div>').attr('class', "card today-card p-4");;

            // city name and date
            var cityNameAndDate = $('<h2>').text(
                response.name + " (" +
                dayjs.unix(response.dt).format('MM/DD/YY') + ")"
            );

            // icon
            var iconCode = response.weather[0].icon;
            var todayIcon = $('<img>').attr({
                src: "https://openweathermap.org/img/w/" + iconCode + ".png",
                height: "50px",
                width: "50px"
            });

            // Temperature(°C) --> (kelvin - 273.15 = °C)
            var todaysTemp = $('<p>').text("Temperature: " + (response.main.temp_max - 273.15).toFixed(2) + " °C");

            // Wind Speed(KPH)
            var todayWind = $('<p>').text("Wind: " + response.wind.speed + " KPH");

            // Humidity(%)
            var todayHumidity = $('<p>').text("Humidity: " + response.main.humidity + "%");

            // append all items
            todayCard.append(todayDiv);
            todayDiv.append(cityNameAndDate, todayIcon, todaysTemp, todayWind, todayHumidity);


            // FIVE DAY FORECAST
            $.ajax({
                url: weatherQueryURL,
                method: "GET"
            }).then(function (response) {

                console.log(response)
                // Forecast for next 5 days
                var forecastTitle = $('<h4>').text("5-Day forecast: ");
                $('#forecast-title').append(forecastTitle);

                // Each day(8 x 3 hr):
                // i+=8 --> i=i+8
                for (i = 0; i < response.list.length; i+=8) {
                    // console.log(response.list[i  ])
                    var forecastDiv = $('<div>').attr('class', "card forecast-card m-3");
                    var forecastCard = $('<div>').attr('class', "card-body");

                    var forecastDate = dayjs(response.list[i].dt_txt).format('MM/DD/YY');


                    //Date
                    var date = $('<h5>').text(forecastDate);
                    var date = $('<h5>').text(dayjs(response.list[i].dt_txt).format('MM/DD/YY'));
                    date.attr('class', 'card-title');

                    // Icon
                    var iconCode = response.list[i].weather[0].icon;
                    var forecastIcon = $('<img>').attr({
                        src: "https://openweathermap.org/img/w/" + iconCode + ".png",
                        height: "50px",
                        width: "50px"
                    });

                    // Temperature
                    var temp = $('<p>').text("Temperature: " + (response.list[i].main.temp_max - 273.15).toFixed(2) + " °C");

                    // Humidity
                    var humidity = $('<p>').text("Humidity: " + response.list[i].main.humidity + "%");
                    
                    // Wind Speed
                    var windSpeed = $('<p>').text("Wind: " + response.list[i].wind.speed + " KPH");


                    // Append elements to forecast card
                    forecastCard.append(date, forecastIcon, temp, humidity, windSpeed);
                    forecastDiv.append(forecastCard);


                    fiveDayForecast.append(forecastDiv);
                    forecastDiv.append(forecastCard);
                    forecastCard.append( forecastIcon, temp, humidity, windSpeed);

                    // add 7 to get to the next day (instead of 8 as the loop already adds 1)
                    // i = i + 6;
                }

            })
        });
    });
};

// GENERATE SEARCH HISTORY BUTTONS
function addToButtons() {

    // get search input
    var input = $("#search-city").val();

    // create button with search input as text content
    var button = $('<button>').text(input);
    button.attr({
        class: 'search-history mb-3',
        "data-name": input
    });

    // add button to history div below search bar
    $('#history').append(button);

    // add to local storage and search terms array
    searchHistory.push(input);
    localStorage.setItem("search-term", JSON.stringify(searchHistory));

};

// on click of previous city button, get weather
$(document).on("click", ".search-history", function (event) {

    // search input is the name within data-name
    searchInput = $(this).attr("data-name");

    // run getweather function to display weather
    getWeather();

});

// render buttons from local storage
function renderButtons() {

    // get local storage
    storageSearchHistory = JSON.parse(localStorage.getItem("search-term"));

    // if local storage is blank, do not add buttons
    if (storageSearchHistory === null) {
        searchHistory = [];

    } else {
        searchHistory = storageSearchHistory;

        // for each storage item, create button
        for (i = 0; i < searchHistory.length; i++) {

            var button = $('<button>').text(searchHistory[i]);

            button.attr({
                class: 'search-history mb-3',
                "data-name": searchHistory[i]
            });

            $('#history').append(button);
        }
    }
};

// render buttons on page load
renderButtons();

// clear local storage on click
$('#clear-history').on("click", function (event) {

    // empty local storage array
    searchHistory = [];

    // empty local storage
    localStorage.removeItem("search-term");

    // remove all buttons previously rendered
    $('#history').empty();

});
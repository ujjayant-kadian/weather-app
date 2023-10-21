new Vue({
  el: "#app", // Vue instance associated with the HTML element with id "app"
  data: {
    // Data properties used by Vue instance
    city: "", // Input city name
    displayCity: "", // Displayed city name
    countryCode: "", // Input country code
    weatherData: [], // Weather data fetched from the API (under the key 'list')
    packingInfo: {
      bringUmbrella: false, // Indicates whether to bring umbrella
      temperatureType: "", // Describes the temperature (Cold, Mild, Hot)
      wearMask: false, // Indicates whether to wear mask
    },
    summaryData: [], // Summary data for weather
    lat: 0, // Latitude for the input city
    lon: 0, // Longitude for the input city
    errorMessage: "", // Error Message
  },
  computed: {
    // Computed property to check if the city input is empty => if empty disable 'Get Weather' button
    isCityEmpty() {
      return this.city.trim() === "";
    },
  },
  methods: {
    // Method to fetch weather data from an API
    async fetchWeatherData(apiUrl) {
      try {
        // Sending a Get request to the API endpoint
        const response = await axios.get(apiUrl);

        // Process the response data
        this.weatherData = response.data.list;
        // console.dir(JSON.stringify(this.weatherData));
        this.displayCity = response.data.city.name;
        this.lat = response.data.city.coord.lat;
        this.lon = response.data.city.coord.lon;

        // Retrieve summary and air pollution data
        this.getSummaryData();
        this.getAirPollutionData();
        this.parseWeatherData();
      } catch (error) {
        // Handle API request error
        console.error("API request to the server failed", error);
        this.errorMessage =
          "Could not fetch the weather details for the entered input! Check the city name and country code. Press 'Clear' to try again.";
      }
    },
    // Method to get weather data based on the entered city and country code
    getWeatherData() {
      // If data already present in the Vue instance => clear and ask for input again
      if (this.checkIfDataAlreadyExists()) return;
      let apiUrl = `/weather/${this.city}`;
      // If user inputs country code, append it to the apiUrl
      if (this.countryCode) {
        apiUrl += `/${this.countryCode}`;
      }
      this.fetchWeatherData(apiUrl);
    },
    // Method to get weather data for the current location
    getWeatherForCurrentLocation() {
      // If data already present in the Vue instance => clear and ask for input again
      if (this.checkIfDataAlreadyExists()) return;
      if (navigator.geolocation) {
        // Retrieve the current location using the Geolocation API
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.lat = position.coords.latitude;
            this.lon = position.coords.longitude;
            const apiUrl = `/current-location?lat=${this.lat}&lon=${this.lon}`;
            this.fetchWeatherData(apiUrl);
          },
          (error) => {
            // Handle error - can not fetch current location
            console.error("Error getting current location", error);
            this.errorMessage = "Can't access current location!";
          }
        );
      } else {
        // Handle error - Geolocation not supported
        console.error("Geolocation is not supported by your browser.");
        this.errorMessage = "Geolocation not supported by the browser!";
      }
    },
    // Method to get air pollution data based on latitude and longitude
    getAirPollutionData() {
      // Sending a Get request to the following API endpoint
      axios
        .get(`/air-pollution?lat=${this.lat}&lon=${this.lon}`)
        .then((response) => {
          // Process air pollution data
          const pollutionData = response.data.list;
          // console.log(pollutionData)

          // Get the current date (Unix format - since the API responds in Unix format) in days
          const currentUnixDate = Math.floor(
            Date.now() / (1000 * 60 * 60 * 24)
          );
          // console.log(currentUnixDate);

          // Only process the air pollution of the following days (exclude current date)
          const filteredAirPollutionData = pollutionData.filter(
            (item) => Math.floor(item.dt / (60 * 60 * 24)) > currentUnixDate
          );

          // Check to see if PM 2.5 exceeds for any item in filterAirPollutionData
          for (const data of filteredAirPollutionData) {
            // console.log(data);
            if (data.components.pm2_5 > 10) {
              this.packingInfo.wearMask = true;
              break;
            }
          }
        })
        .catch((error) => {
          // Handle API request error
          console.error(
            "API request to the server for air pollution failed:",
            error
          );
          this.errorMessage = "Couldn't fetch air pollution details!";
        });
    },
    // Method to calculate summary data for weather
    getSummaryData() {
      // Initialize variables to store daily totals
      let dailyTemperatureSum = 0;
      let dailyWindSpeedSum = 0;
      let dailyRainfallSum = 0;
      let dailyDataCount = 0;
      let currentDay = null;

      // Iterate through the weather data list
      this.weatherData.forEach((data) => {
        // Extract the date from dt_txt (it's in the format 'YYYY-MM-DD HH:MM:SS')
        const date = data.dt_txt.split(" ")[0];

        // Check if it's a new day
        if (date !== currentDay) {
          // If it's a new day, calculate and store the averages for the previous day
          if (currentDay) {
            const averageTemperature = dailyTemperatureSum / dailyDataCount;
            const averageWindSpeed = dailyWindSpeedSum / dailyDataCount;
            const averageRainfall = dailyRainfallSum / dailyDataCount;

            // Add the summary data for the previous day
            this.summaryData.push({
              date: currentDay,
              averageTemperature,
              averageWindSpeed,
              averageRainfall,
            });

            // Reset daily totals for the new day
            dailyTemperatureSum = 0;
            dailyWindSpeedSum = 0;
            dailyRainfallSum = 0;
            dailyDataCount = 0;
          }

          // Update the current day
          currentDay = date;
        }

        // Accumulate data for the current day
        dailyTemperatureSum += data.main.temp;
        dailyWindSpeedSum += data.wind.speed;
        if (data.rain && data.rain["3h"]) {
          dailyRainfallSum += data.rain["3h"];
        }

        dailyDataCount += 1;
      });

      // Calculate and store the summary data for the last day in the list
      if (currentDay) {
        const averageTemperature = dailyTemperatureSum / dailyDataCount;
        const averageWindSpeed = dailyWindSpeedSum / dailyDataCount;
        const averageRainfall = dailyRainfallSum / dailyDataCount;

        this.summaryData.push({
          date: currentDay,
          averageTemperature,
          averageWindSpeed,
          averageRainfall,
        });
      }
      // Remove the current date from the list
      this.summaryData.shift();
      // console.log(this.summaryData);
    },
    // Method to parse weather data to make packing suggestions
    parseWeatherData() {
      // If there is rainfall in any particular day => Get Umbrella
      for (const day of this.summaryData) {
        if (day.averageRainfall > 0) {
          this.packingInfo.bringUmbrella = true;
          break;
        }
      }
      // Finding the minimum average temperature to determine temperature type
      const minAverageTemperature = Math.min(
        ...this.summaryData.map((day) => day.averageTemperature)
      );
      this.packingInfo.temperatureType = this.getTemperatureType(
        minAverageTemperature
      );
      // console.log(this.packingInfo.temperatureType);
    },
    // Method to determine temperature type based on the temperature
    getTemperatureType(temperature) {
      if (temperature < 13) return "Cold";
      else if (temperature >= 13 && temperature <= 23) return "Mild";
      else return "Hot";
    },
    // Method to check if weather data already exists and confirm reset
    checkIfDataAlreadyExists() {
      if (this.weatherData.length > 0) {
        if (
          confirm(
            "Data already fetched for a particular city. Do you want to clear and fetch again?"
          )
        ) {
          this.resetData();
        } else {
          alert(
            "You chose to keep the existing data. Clear it manually to fetch the data for new city."
          );
        }
        return true;
      }
    },
    // Method to reset all data properties
    resetData() {
      this.city = "";
      this.displayCity = "";
      this.countryCode = "";
      this.weatherData = [];
      this.packingInfo.bringUmbrella = false;
      this.packingInfo.temperatureType = "";
      this.packingInfo.wearMask = false;
      this.summaryData = [];
      this.errorMessage = "";
    },
  },
});

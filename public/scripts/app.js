new Vue({
  el: "#app",
  data: {
    city: "",
    displayCity: "",
    countryCode: "",
    weatherData: [],
    packingInfo: {
      bringUmbrella: false,
      temperatureType: "",
      wearMask: false,
    },
    summaryData: [],
    lat: 0,
    lon: 0,
    errorMessage: "",
  },
  computed: {
    isCityEmpty() {
      return this.city.trim() === "";
    },
  },
  methods: {
    async fetchWeatherData(apiUrl) {
      try {
        const response = await axios.get(apiUrl);
        this.weatherData = response.data.list;
        // console.dir(JSON.stringify(this.weatherData));
        this.displayCity = response.data.city.name;
        this.lat = response.data.city.coord.lat;
        this.lon = response.data.city.coord.lon;
        this.getSummaryData();
        this.getAirPollutionData();
        this.parseWeatherData();
      } catch (error) {
        console.error("API request to the server failed", error);
        this.errorMessage = "Could not fetch the weather details for the entered input! Check the city name and country code. Press 'Clear' to try again."
      }
    },
    getWeatherData() {
      if (this.checkIfDataAlreadyExists()) return;
      let apiUrl = `/weather/${this.city}`;
      if (this.countryCode) {
        apiUrl += `/${this.countryCode}`;
      }
      this.fetchWeatherData(apiUrl);
    },
    getWeatherForCurrentLocation() {
      if (this.checkIfDataAlreadyExists()) return;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.lat = position.coords.latitude;
            this.lon = position.coords.longitude;
            const apiUrl = `/current-location?lat=${this.lat}&lon=${this.lon}`;
            this.fetchWeatherData(apiUrl);
          },
          (error) => {
            console.error("Error getting current location", error);
            this.errorMessage = "Can't access current location!";
          }
        );
      } else {
        console.error("Geolocation is not supported by your browser.");
        this.errorMessage = 'Geolocation not supported by the browser!'
      }
    },
    getAirPollutionData() {
      axios
        .get(`/air-pollution?lat=${this.lat}&lon=${this.lon}`)
        .then((response) => {
          const pollutionData = response.data.list;
          // console.log(pollutionData)
          const currentUnixDate = Math.floor(
            Date.now() / (1000 * 60 * 60 * 24)
          );
          // console.log(currentUnixDate);
          const filteredAirPollutionData = pollutionData.filter(
            (item) => Math.floor(item.dt / (60 * 60 * 24)) > currentUnixDate
          );
          for (const data of filteredAirPollutionData) {
            // console.log(data);
            if (data.components.pm2_5 > 10) {
              this.packingInfo.wearMask = true;
              break;
            }
          }
        })
        .catch((error) => {
          console.error(
            "API request to the server for air pollution failed:",
            error
          );
          this.errorMessage = "Couldn't fetch air pollution details!"
        });
    },
    getSummaryData() {
      // Initialize variables to store daily totals
      let dailyTemperatureSum = 0;
      let dailyWindSpeedSum = 0;
      let dailyRainfallSum = 0;
      let dailyDataCount = 0;
      let currentDay = null;

      // Iterate through the weather data list
      this.weatherData.forEach((data) => {
        // Extract the date from dt_txt (assuming it's in the format 'YYYY-MM-DD HH:MM:SS')
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
      this.summaryData.shift();
      // console.log(this.summaryData);
    },
    parseWeatherData() {
      for (const day of this.summaryData) {
        if (day.averageRainfall > 0) {
          this.packingInfo.bringUmbrella = true;
          break;
        }
      }
      const minAverageTemperature = Math.min(
        ...this.summaryData.map((day) => day.averageTemperature)
      );
      this.packingInfo.temperatureType = this.getTemperatureType(
        minAverageTemperature
      );
      // console.log(this.packingInfo.temperatureType);
    },
    getTemperatureType(temperature) {
      if (temperature < 13) return "Cold";
      else if (temperature >= 13 && temperature <= 23) return "Mild";
      else return "Hot";
    },
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
    resetData() {
      this.city = "";
      this.displayCity = "";
      this.countryCode = "";
      this.weatherData = [];
      this.packingInfo.bringUmbrella = false;
      this.packingInfo.temperatureType = "";
      this.packingInfo.wearMask = false;
      this.summaryData = [];
      this.errorMessage="";
    },
  },
});

// Importing necessary packages
const express = require("express");
const axios = require("axios");

// Creating a new instance of Express Route
const router = express.Router();

// Initialising api key for OpenWeatherAPI
const apiKey = "cda8a7cd5811f762cee88308d37da4c7";

// Route to fetch weather forecast data by city and optional country code
router.get("/weather/:city/:countryCode?", async (req, res) => {
  try {
    const city = req.params.city;
    const countryCode = req.params.countryCode || "";

    // Construct the forecast url
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}${
      countryCode ? `,${countryCode}` : ""
    }&appid=${apiKey}&units=metric`;

    // Make an API request to fetch weather data
    const forecastResponse = await axios.get(forecastUrl);
    res.json(forecastResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "API request for weather forecast failed" });
  }
});

// Route to fetch weather forecast data by current location (latitude and longitude) => for current location functionality
router.get("/current-location", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // Construct the forecast URL
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    // Make an API request to fetch weather data
    const forecastResponse = await axios.get(forecastUrl);
    res.json(forecastResponse.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "API request for weather forecast failed" });
  }
});

// Route to fetch air pollution forecast data by latitude and longitude
router.get("/air-pollution", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // Construct the air pollution forecast URL
    const airPollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    // Make an API request to fetch air pollution data
    const airPollutionResponse = await axios.get(airPollutionUrl);
    // console.log(JSON.stringify(airPollutionResponse.data));
    res.json(airPollutionResponse.data);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "API request for air pollution forecast failed" });
  }
});

module.exports = router;

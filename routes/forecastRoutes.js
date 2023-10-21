const express = require("express");
const axios = require("axios");

const router = express.Router();

const apiKey = "cda8a7cd5811f762cee88308d37da4c7";

router.get("/weather/:city/:countryCode?", async (req, res) => {
  try {
    const city = req.params.city;
    const countryCode = req.params.countryCode || "";

    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}${
      countryCode ? `,${countryCode}` : ""
    }&appid=${apiKey}&units=metric`;
    const forecastResponse = await axios.get(forecastUrl);
    res.json(forecastResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "API request for weather forecast failed" });
  }
});

router.get("/current-location", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const forecastResponse = await axios.get(forecastUrl);
    res.json(forecastResponse.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "API request for weather forecast failed" });
  }
});

router.get("/air-pollution", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const airPollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
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

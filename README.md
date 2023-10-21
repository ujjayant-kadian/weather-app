# Weather App

The Weather App is a web application that provides weather information, packing suggestions (by taking weather and air pollution into consideration) based on the location you specify or your current location.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Styling](#styling)
- [License](#license)

## Features

- Fetch weather data for a specific city.
- Get weather information for your current location.
- Display weather details including temperature, rainfall, and wind speed.
- Provides packing suggestions based on temperature and the chance of rain.
- Alerts you to wear a mask when air pollution levels (PM2.5) exceed 10.
- View a summary of weather data for upcoming days.
- A user-friendly interface.

## Getting Started

These instructions will help you set up and run the Weather App on your local machine.

1. **Clone this repository** to your local machine:

   ```bash
   git clone https://github.com/ujjayant-kadian/weather-app.git

2. **Navigate to the project directory**:

    ```bash
    cd weather-app

3. **Install the required dependencies** using npm package manager:

   ```bash
   npm install

4. **Create an account** on [OpenWeatherMap](https://openweathermap.org/) to obtain an API key.

5. **Replace your api key** in [routes/forecast.js](https://github.com/ujjayant-kadian/weather-app/blob/main/routes/forecastRoutes.js):

   ```const apiKey = {YOUR_API_KEY} ```


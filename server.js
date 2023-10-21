//Importing necessary modules and packages
const path = require('path');

const express = require('express');

const forecastRoutes = require('./routes/forecastRoutes');

//Creating an Express Application
const app = express();
//Defining the port on which the server will run
const port = 3000;

//Path to the 'public' directory where static files are stored
const publicPath = path.resolve(__dirname, 'public')

// Serving static files from the 'public' directory
app.use(express.static(publicPath));

//Parsing incoming requests as URL-encoded or JSON data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Using the forecastRoutes to handle routing
app.use(forecastRoutes);

//Starting the express server and listening on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
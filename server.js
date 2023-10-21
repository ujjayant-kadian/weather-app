const path = require('path');

const express = require('express');

const forecastRoutes = require('./routes/forecastRoutes');

const app = express();
const port = 3000;

const publicPath = path.resolve(__dirname, 'public')

// Serve static files (index.html)
app.use(express.static(publicPath));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(forecastRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
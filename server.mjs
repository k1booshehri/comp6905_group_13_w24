import express from "express";

const app = express();
const port = 3000;

// app.get('/', (req, res) => {
//   res.send('Skier Routing App');
// });



// // Serve static files from the 'public' directory
// app.use(express.static('public'));

// // Define a route for the main page
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


// const express = require('express');
// const path = require('path');

// const app = express();
// const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

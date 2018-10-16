const express = require('express');
const path = require('path');

// Set up express
let app = express();
const PORT = process.env.PORT || 5002;

// Serve files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// One path, serve the visuals
app.get('/', (req, res) => {
    res.sendFile('public/index.html');
});

// Serve the page
let server = app.listen(PORT, () => console.log(`Experiment being served at localhost:${PORT}`));
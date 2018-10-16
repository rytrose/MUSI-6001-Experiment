const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

// Set up express
let app = express();
const PORT = process.env.PORT || 5002;

// Serve files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Expect body in json
app.use(express.json());

// One path, serve the visuals
app.get('/', (req, res) => {
    res.sendFile('public/index.html');
});

app.post('/save', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO results (name, result) VALUES ($1, $2)', [req.body.name, req.body.result]);
        res.send("Inserted.");
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

// Serve the page
let server = app.listen(PORT, () => console.log(`Experiment being served at localhost:${PORT}`));
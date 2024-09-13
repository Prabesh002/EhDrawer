const express = require('express');
const path = require('path');
const generateRouter = require('./src/Paths/generate');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'Static')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Static', 'index.html'));
});

app.use('/generate', generateRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

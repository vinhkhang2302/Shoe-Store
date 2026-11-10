const express = require('express');
const app = express();
const route = require('./routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./Config/db');
const path = require('path');

require('dotenv').config();

const port = Number(process.env.PORT) || 5001;

const http = require('http');
const { askQuestion } = require('./utils/chatbot');
const server = http.createServer(app);

app.use(cookieParser());
app.use(cors({ origin: process.env.REACT_APP_URL, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

route(app);
connectDB();

app.post('/chat', async (req, res) => {
    const { question } = req.body;
    const data = await askQuestion(question);
    return res.status(200).json(data);
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Kainie API listening on port ${port}`);
});

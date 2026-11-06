const express = require('express');
const app = express();
const route = require('./routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./Config/db');
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config();

const port = Number(process.env.PORT) || 5001;

const http = require('http');
const { Server } = require('socket.io');
const { askQuestion } = require('./utils/chatbot');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.REACT_APP_URL,
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
});

app.use(cookieParser());
app.use(cors({ origin: process.env.REACT_APP_URL, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '')));

route(app);
connectDB();

app.post('/chat', async (req, res) => {
    const { question } = req.body;
    const data = await askQuestion(question);
    return res.status(200).json(data);
});

server.listen(port, '0.0.0.0', () => {
    // Sử dụng server.listen thay vì app.listen
    console.log(`Example app listening on port ${port}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('config');

const AuthRouter = require('./Routes/AuthRouter');
const PostRouter = require('./Routes/PostRouter');

const app = express();
const http = require('http').Server(app);

const corsOptions = {
    origin: config.get("LOCAL_FRONT"),
    credentials: true,
    optionSuccessStatus: 200
}

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/user', AuthRouter);
app.use('/api/post', PostRouter);

app.get('/', (req, res) => {
    res.send('Hello from the other side');
})

app.all('*', (req, res, next) => {
    res.status(404).send("Page not found!");
})

mongoose.connect(config.get("DB_CONNECTION"))
    .then(() => console.log(`Connected to ${config.get("DB_CONNECTION")}...`))
    .catch((err) => console.log(err.message));

const server = http.listen(process.env.PORT || config.get("PORT"), err => {
    if (err) console.log(err.message)
    console.log('Server is running...')
})

module.exports = server;

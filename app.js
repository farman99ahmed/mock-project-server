require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connection = require("./config/database");
const user = require('./routes/user');
const game = require('./routes/game');

const app = express();
const PORT = process.env.PORT || 5000;

connection();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.get('/', (req, res) => res.send('Server is running'));
app.use('/user', user);
app.use('/game', game);

app.listen(PORT, () => {
    console.log(`App is running on PORT ${PORT}`)
});

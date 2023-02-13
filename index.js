const express = require('express');
const app = express();
require('./db_config');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', require('./router/user_router'));

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server listening at the port ${port}`);
})
const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const app = express();
const members_api = require('./api/members');
const keys_api = require('./api/keys');
const twit_api = require('./api/twitter');
var cors = require('cors');

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use(cors());

//init middleware
app.use(logger);

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// set a static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

//Members API routes
app.use('/api/members', members_api);
//tweets API routes
app.use('/api/tweets', twit_api);
//Keys API routes
app.use('/api/keys', keys_api);

const PORT = process.env.PORT || 5010;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));






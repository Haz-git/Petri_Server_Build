//Dependencies:
const express = require('express');
const userRouter = require('./routes/userRouter');
const cors = require('cors');

//Security Dependencies:
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp')

//Creating Express application object:
const app = express();

// ||||GLOBAL MIDDLEWARES:||||

//Helmet: Set security HTTP headers
app.use(helmet());

//Rate-limiting: Limit requests to API from IP
const limiter = rateLimit({
    //Allow 1000 requests from same IP in one hour:
    max: 1000, 
    windowMs: 60 * 60 * 100,
    message: 'Too many requests from this IP, please try again in an hour.'
});
app.use('/api', limiter);

//JSON: Added limiter to reduce DDOS
app.use(express.json({ limit: '10kb' }));

//Data Sanitization: noSQL query injection
app.use(mongoSanitize());

//Data Sanitization: XSS
app.use(xss());

//HPP: Prevent Parameter Pollution:
app.use(hpp());
//^You can pass in an object { whitelist: ["a","b","c"] } with whitelisted parameters.

//CORS Policy:
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(function(req, res, next) {
    res.header('Content-Type', 'application/json;charset=UTF-8');
    res.header('Access-Control-Allow-Credentials', true)
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
      'Access-Control-Allow-Origin'
    )
    res.header({
        credentials: 'include',
    })
    next()
})


//Attaching Main Routes:
app.use('/api/users', userRouter);

module.exports = app;
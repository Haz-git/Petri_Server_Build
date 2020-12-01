//Modules:
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Model:
const User = require('../models/userModels');

//Utilities:
const handleAsync = require('../utils/handleAsync');
const throwAppError = require('../utils/throwAppError');

//Creating function to sign JWT:
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

//Function to send token via cookie:
const createSendToken = (user, statusCode, res, message, completed) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);

    //Remove password from res.body:
    user.password = undefined;

    res.status(statusCode).json({
        status: 'Success',
        token,
        message,
        completed,
        data: {
            user
        }
    })
}

//Sign up Controller:

exports.signup = handleAsync(async(req, res, next) => {

    //Extracting Request User Data:
    const {
        firstName,
        lastName,
        userName,
        email,
        password,
        passwordConfirm,
    } = req.body;

    //Creating new User in DB:
    const newUser = await User.create({
        firstName,
        lastName,
        userName,
        email,
        password,
        passwordConfirm,
    });

    // createSendToken(newUser, 201, res, 'New User Created.', true);
    // Stop giving user token on sign up...
    // const token = signToken(newUser._id);

    res.status(200).json({
        status: 'Success',
        // token,
        message: 'This User has been added to the DB',
        completed: true,
        data: {
            user: newUser
        }
    });
});

//Login Controller:

exports.login = handleAsync(async (req, res, next) => {

    //1. Grab email and password from request object. Check if email and password exist.
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new throwAppError('Please enter your email and password', 400));
    }

    //2. Find email from documents in mongodb. Grab user with email and password.

    const user = await User.findOne({ email }).select('+password');

    //3. Use instance method to hash inputted password and compare with stored password to see if correct:
    //4. If match, send Token to client.

    //Instance methods only availiable to documents.
    if (!user || await user.comparePasswords(password, user.password) === false) {
        return next(new throwAppError('Sorry! Your email or password does not match!', 401))
    }

    const token = signToken(user._id);

    //Find the same user for data processing into redux store, but exclude password:
    const returnedUser = await User.findOne({ email });

    res.status(200).json({
        status: 'Success',
        message: 'You are logged in.',
        token,
        data: returnedUser,
    });

    // createSendToken(user, 200, res, 'Currently: Logged In', true);
});

//Logout Controller:

exports.logout = handleAsync(async (req, res) => {
    res.clearCookie('jwt').status(200).json({
        status: 'Success',
        message: 'User has been successfully logged out',
    })
});

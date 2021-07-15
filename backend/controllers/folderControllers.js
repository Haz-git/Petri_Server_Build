//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');

exports.getFolders = handleAsync(async(req, res) => {
    res.status(200).json({
        status: 'Success',
        msg: 'Route established1'
    });
});

exports.addFolder = handleAsync(async(req, res) => {
    res.status(200).json({
        status: 'Success',
        msg: 'Route established2'
    });
});

exports.deleteFolder = handleAsync(async(req, res) => {
    res.status(200).json({
        status: 'Success',
        msg: 'Route established3'
    });
});

exports.renameFolder = handleAsync(async(req, res) => {
    res.status(200).json({
        status: 'Success',
        msg: 'Route established4'
    });
});
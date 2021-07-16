const { v4: uuidv4 } = require('uuid');

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

    const { _id, folderName } = req.body;

    const userNotebook = await User.findOne({ _id }).select('notebook');

    userNotebook.notebook.folders.push({ folderName: folderName, folderId: uuidv4(), notes: []});

    await User.updateOne({ _id }, { notebook: userNotebook.notebook }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedNotebook = await User.findOne({ _id }).select('notebook');

    res.status(200).json({
        status: 'Success',
        userNotebook: updatedNotebook.notebook
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
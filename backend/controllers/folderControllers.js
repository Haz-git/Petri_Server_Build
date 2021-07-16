const { v4: uuidv4 } = require('uuid');

//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');

exports.getNotebook = handleAsync(async(req, res) => {

    const { _id } = req.body;

    const userNotebook = await User.findOne({ _id }).select('notebook');

    res.status(200).json({
        status: 'Success',
        userNotebook: userNotebook.notebook
    });
});

exports.addFolder = handleAsync(async(req, res) => {

    const { _id, folderName, parentId } = req.body;

    const userNotebook = await User.findOne({ _id }).select('notebook');

    const folderObject = { folderName: folderName, folderId: uuidv4(), children: [], parentId}

    userNotebook.notebook.rootFolders.push(folderObject);

    if (parentId !== 'root') {
        userNotebook.notebook = userNotebook.injectChildToParent(folderObject, parentId, userNotebook.notebook);
    }

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

    const { _id, folderId, parentId } = req.body;

    const userNotebook = await User.findOne({ _id }).select('notebook');

    const delIdx = userNotebook.notebook.rootFolders.findIndex((folder) => {
        if (folder.folderId === folderId) return true;
    });

    userNotebook.notebook.rootFolders.splice(delIdx, 1);

    if (parentId !== 'root') {
        userNotebook.notebook = userNotebook.removeChildFromParent(folderId, parentId, userNotebook.notebook);
    }

    await User.updateOne({ _id }, { notebook: userNotebook.notebook }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedNotebook = await User.findOne({ _id }).select('notebook');
    

    res.status(200).json({
        status: 'Success',
        userNotebook: updatedNotebook.notebook
    });
});

exports.renameFolder = handleAsync(async(req, res) => {

    const { _id, folderId, newFolderName } = req.body;;

    const userNotebook = await User.findOne({ _id }).select('notebook'); 
    
    const targetIdx = userNotebook.notebook.rootFolders.findIndex((folder) => {
        if (folder.folderId === folderId) return true;
    });

    userNotebook.notebook.rootFolders[targetIdx].folderName = newFolderName;

    await User.updateOne({ _id }, { notebook: userNotebook.notebook }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedNotebook = await User.findOne({ _id }).select('notebook');
    

    res.status(200).json({
        status: 'Success',
        userNotebook: updatedNotebook.notebook
    });

});
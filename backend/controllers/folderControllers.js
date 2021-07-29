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

    const folderObject = { 
        folderName: folderName,
        folderId: uuidv4(), 
        children: [], 
        parentId, 
        dateCreated: new Date(), 
        dateModified: new Date(), 
        ownerName: 'Me',
        isStarred: 'FALSE',
    }

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

    if (userNotebook.notebook.rootFolders[delIdx].children.length !== 0) {
        userNotebook.notebook = userNotebook.removeFolderContents(folderId, userNotebook.notebook);
    }

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

    const { _id, folderId, parentId, newFolderName } = req.body;;

    const userNotebook = await User.findOne({ _id }).select('notebook'); 
    
    const targetIdx = userNotebook.notebook.rootFolders.findIndex((folder) => {
        if (folder.folderId === folderId) return true;
    });

    userNotebook.notebook.rootFolders[targetIdx].folderName = newFolderName;
    userNotebook.notebook.rootFolders[targetIdx].dateModified = new Date();

    if (parentId !== 'root') {
        userNotebook.notebook = userNotebook.editChildOfParent(folderId, parentId, 'folderName', newFolderName ,userNotebook.notebook);
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

exports.updateStarredFolder = handleAsync(async(req, res) => {

    const {_id, folderId, parentId, requestType} = req.body;

    const userNotebook = await User.findOne({ _id }).select('notebook');

    switch (requestType) {
        case 'ADD_FOLDER_TO_STARRED':
            userNotebook.notebook = userNotebook.editEntityProperty(userNotebook.notebook, 'FOLDER', folderId, 'isStarred', 'TRUE');
            userNotebook.notebook = userNotebook.editEntityProperty(userNotebook.notebook, 'FOLDER', folderId, 'dateModified', new Date());
            break;
        case 'REMOVE_FOLDER_FROM_STARRED':
            userNotebook.notebook = userNotebook.editEntityProperty(userNotebook.notebook, 'FOLDER', folderId, 'isStarred', 'FALSE');
            userNotebook.notebook = userNotebook.editEntityProperty(userNotebook.notebook, 'FOLDER', folderId, 'dateModified', new Date());
            break;
        default:
            throw new Error('No requestType or unidentified requestType provided. Please use ADD_FOLDER_TO_STARRED || REMOVE_FOLDER_FROM_STARRED');
    }

    if (parentId !== 'root') {

        switch (requestType) {
            case 'ADD_FOLDER_TO_STARRED':
                userNotebook.notebook = userNotebook.editChildOfParent(folderId, parentId, 'isStarred','TRUE',userNotebook.notebook);
                break;
            case 'REMOVE_FOLDER_FROM_STARRED':
                userNotebook.notebook = userNotebook.editChildOfParent(folderId, parentId, 'isStarred','FALSE',userNotebook.notebook);
                break;
            default:
                throw new Error('No requestType or unidentified requestType provided. Please use ADD_FOLDER_TO_STARRED || REMOVE_FOLDER_FROM_STARRED');
        }
    }

    //Update User with new notebook:
    await User.updateOne({ _id }, { notebook: userNotebook.notebook }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    //Return updated notebook
    const updatedNotebook = await User.findOne({ _id }).select('notebook');


    res.status(200).json({
        status: 'Success',
        userNotebook: updatedNotebook.notebook
    });


})
const { v4: uuidv4 } = require('uuid');

//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');


exports.addNote = handleAsync(async(req, res) => {

    //Extract data:
    const { htmlState, _id, noteName, parentId } = req.body;

    //Find Appropriate User and select notebook:
    const userNotebook = await User.findOne({ _id }).select('notebook');

    const notesObject = {
        noteId: uuidv4(),
        noteName: noteName, 
        htmlState, 
        parentId,
        ownerName: 'Me',
        dateCreated: new Date(),
        dateModified: new Date(),
        isStarred: 'FALSE',
    }
    
    //Update the notebook array:
    userNotebook.notebook.rootFiles.push(notesObject);

    //Assign note to children of a folder if applicable:
    if (parentId !== 'root') {
        userNotebook.notebook = userNotebook.injectChildToParent(notesObject, parentId, userNotebook.notebook);
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

exports.getNotes = handleAsync(async(req, res) => {
    const { _id } = req.body;

    const userExistingBioNotesCollection = await User.findOne({ _id }).select('bionotes');

    res.status(200).json({
        status: 'Success',
        userExistingBioNotesCollection
    })
})

exports.updateNote = handleAsync(async(req, res) => {

    const { _id, noteId, parentId, requestType, updatedHTMLState, updatedNoteName } = req.body;

    //RequestType could be UPDATE_NAME || UPDATE_HTML || UPDATE_ALL

    const userNotebook = await User.findOne({ _id }).select('notebook');


    switch (requestType) {
        case 'UPDATE_NAME':
            targetObject = userNotebook.notebook.rootFiles.find(x => x.noteId === noteId)
            
            targetObject['noteName'] = updatedNoteName;
            targetObject['dateModified'] = new Date();
            break;
        case 'UPDATE_HTML':
            targetObject = userNotebook.notebook.rootFiles.find(x => x.noteId === noteId)
            
            targetObject['htmlState'] = updatedHTMLState;
            targetObject['dateModified'] = new Date();
            break;
        case 'UPDATE_ALL':
            targetObject = userNotebook.notebook.rootFiles.find(x => x.noteId === noteId);

            targetObject['htmlState'] = updatedHTMLState;
            targetObject['noteName'] = updatedNoteName;
            targetObject['dateModified'] = new Date();
            break;
        default:
            throw new Error('No requestType or unidentified requestType provided. Please use UPDATE_NAME || UPDATE_HTML || UPDATE_ALL');
    }

    if (parentId !== 'root') {

        switch (requestType) {
            case 'UPDATE_NAME':
                userNotebook.notebook = userNotebook.editChildOfParent(noteId, parentId, 'noteName',updatedNoteName,userNotebook.notebook);
                break;
            case 'UPDATE_HTML':
                userNotebook.notebook = userNotebook.editChildOfParent(noteId, parentId, 'htmlState',updatedHTMLState,userNotebook.notebook);
                break;
            case 'UPDATE_ALL':
                //Need something more efficient.
                userNotebook.notebook = userNotebook.editChildOfParent(noteId, parentId, 'noteName',updatedNoteName,userNotebook.notebook);
                userNotebook.notebook = userNotebook.editChildOfParent(noteId, parentId, 'htmlState',updatedHTMLState,userNotebook.notebook);
                break;
            default:
                throw new Error('No requestType or unidentified requestType provided. Please use UPDATE_NAME || UPDATE_HTML || UPDATE_ALL');
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

exports.deleteNote = handleAsync(async(req, res) => {
    const { _id, noteId, parentId } = req.body;

    const userNotebook = await User.findOne({ _id }).select('notebook');

    const delIdx = userNotebook.notebook.rootFiles.findIndex((note) => {
        if (note.noteId === noteId) return true;
    });

    userNotebook.notebook.rootFiles.splice(delIdx, 1);

    if (parentId !== 'root') {
        userNotebook.notebook = userNotebook.removeChildFromParent(noteId, parentId, userNotebook.notebook);
    }

    await User.updateOne({ _id }, { notebook: userNotebook.notebook }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    //Return updated notebook
    const updatedNotebook = await User.findOne({ _id }).select('notebook');

    res.status(200).json({
        status: 'Success',
        userNotebook: updatedNotebook.notebook
    });

});

exports.updateStarredNote = handleAsync(async(req,res) => {
    const {_id, noteId, parentId, requestType} = req.body;

    const userNotebook = await User.findOne({ _id }).select('notebook');

    switch (requestType) {
        case 'ADD_NOTE_TO_STARRED':
            userNotebook.notebook = userNotebook.editEntityProperty(userNotebook.notebook, 'NOTE', noteId, 'isStarred', 'TRUE');
            userNotebook.notebook = userNotebook.editEntityProperty(userNotebook.notebook, 'NOTE', noteId, 'dateModified', new Date());
            break;
        case 'REMOVE_NOTE_FROM_STARRED':
            userNotebook.notebook = userNotebook.editEntityProperty(userNotebook.notebook, 'NOTE', noteId, 'isStarred', 'FALSE');
            userNotebook.notebook = userNotebook.editEntityProperty(userNotebook.notebook, 'NOTE', noteId, 'dateModified', new Date());
            break;
        default:
            throw new Error('No requestType or unidentified requestType provided. Please use ADD_NOTE_TO_STARRED || REMOVE_NOTE_FROM_STARRED');
    }

    if (parentId !== 'root') {

        switch (requestType) {
            case 'ADD_NOTE_TO_STARRED':
                userNotebook.notebook = userNotebook.editChildOfParent(noteId, parentId, 'isStarred','TRUE',userNotebook.notebook);
                break;
            case 'REMOVE_NOTE_FROM_STARRED':
                userNotebook.notebook = userNotebook.editChildOfParent(noteId, parentId, 'isStarred','FALSE',userNotebook.notebook);
                break;
            default:
                throw new Error('No requestType or unidentified requestType provided. Please use ADD_NOTE_TO_STARRED || REMOVE_NOTE_FROM_STARRED');
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

});


exports.moveNote = handleAsync(async(req, res) => {

    const {_id, noteId, parentId, targetParentId } = req.body;
    
    const userNotebook = await User.findOne({ _id }).select('notebook');

    /* 
        IF IN ROOT DIRECTORY
        1. Update the parentId of the file in rootFiles.
        2. Append the note to 'children' of the target folder.

        IF NESTED NOTE
        1. Update the parentId of the file in rootFiles.
        2. Inject note into folder's children array.
        3. Remove the note from old parent.
    */

       
    const currentNoteIdx = userNotebook.findEntity(noteId, 'NOTE', userNotebook.notebook, 'INDEX');


    //Inject the Note into the target Note's children array.

    const currentNoteObj = userNotebook.findEntity(noteId, 'NOTE', userNotebook.notebook, 'OBJECT');

    userNotebook.notebook = userNotebook.injectChildToParent(currentNoteObj, targetParentId, userNotebook.notebook);

    //Updating the parentId to the desired parentId, or where we'll move the Note.
    userNotebook.notebook.rootFiles[currentNoteIdx]['parentId'] = targetParentId;

    if (parentId !== 'root') {
        userNotebook.notebook = userNotebook.removeChildFromParent(noteId, parentId, userNotebook.notebook);
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
});
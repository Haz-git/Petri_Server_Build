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

})
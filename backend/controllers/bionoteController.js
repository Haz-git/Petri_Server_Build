const { v4: uuidv4 } = require('uuid');

//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');


exports.addBioNote = handleAsync(async(req, res) => {

    //Extract data:
    const { htmlState, _id, bioName, parentId } = req.body;

    //Find Appropriate User and select notebook:
    const userNotebook = await User.findOne({ _id }).select('notebook');

    const notesObject = {
        noteId: uuidv4(),
        noteName: bioName, 
        htmlState, 
        parentId
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

exports.getBioNotes = handleAsync(async(req, res) => {
    const { _id } = req.body;

    const userExistingBioNotesCollection = await User.findOne({ _id }).select('bionotes');

    res.status(200).json({
        status: 'Success',
        userExistingBioNotesCollection
    })
})

exports.updateBioNote = handleAsync(async(req, res) => {

    const { _id, bionote_ID, updatedHTMLState } = req.body;

    //Find target User and select bionotes:

    const userBioNoteCollection = await User.findOne({ _id }).select('bionotes');

    //Iterate through bionotes, find the one with the correct bioName, replace old updatedHTMLState with new from req.body.

    userBioNoteCollection.bionotes.find(x => x.bionote_ID === bionote_ID)['htmlState'] = updatedHTMLState;

    //Update document:

    await User.updateOne({ _id }, { bionotes: userBioNoteCollection.bionotes }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    //answer response with new updated bionotes collection for state update in client-side.

    const updatedUserBioNoteCollection = await User.findOne({ _id }).select('bionotes');

    res.status(200).json({
        status: 'Success',
        updatedUserBioNoteCollection,
    })
})

exports.deleteBioNote = handleAsync(async(req, res) => {
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
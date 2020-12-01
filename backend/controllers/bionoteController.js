//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');

exports.addBioNote = handleAsync(async(req, res) => {

    //Extract data:
    const { data, _id, bioName } = req.body;

    //Find Appropriate User and select bionotes array:
    const userExistingBioNotesCollection = await User.findOne({ _id }).select('bionotes');
    
    //Update bionotes array:
    userExistingBioNotesCollection.bionotes.push({bioName, data});

    //Update User with new bionotes array:
    await User.updateOne({ _id }, { bionotes: userExistingBioNotesCollection.bionotes }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    //Find updated user again for response:
    const userNewBioNotesCollection = await User.findOne({ _id }).select('bionotes');


    res.status(200).json({
        status: 'Success',
        userNewBioNotesCollection
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

    const { _id, bioName, data } = req.body;

    //Find target User and select bionotes:

    const userBioNoteCollection = await User.findOne({ _id }).select('bionotes');

    //Iterate through bionotes, find the one with the correct bioName, replace old data with new from req.body.

    userBioNoteCollection.bionotes.find(x => x.bioName === bioName)['data'] = data;

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
    const { _id, bioName } = req.body;

    let userBioNoteCollection = await User.findOne({ _id }).select('bionotes');

    //This is perhaps inefficient. What happens when a user has same bionote names? I think i'll generate a uuid() and then use that for deletion...
    userBioNoteCollection.bionotes.splice(userBioNoteCollection.bionotes.indexOf(x => x.bioName === bioName), 1);

    await User.updateOne({ _id }, { bionotes: userBioNoteCollection.bionotes }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const deletedUserBioNoteCollection = await User.findOne({ _id }).select('bionotes');

    res.status(200).json({
        status: 'Success',
        deletedUserBioNoteCollection,
    })

})
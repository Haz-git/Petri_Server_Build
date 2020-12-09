//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');

exports.getProfilePicture = handleAsync(async (req, res) => {
    const { _id } = req.body;

    const existingUser = await User.findOne({ _id });

    res.status(200).json({
        status: 'Success',
        existingUser
    })

})


exports.addProfilePicToUser = handleAsync(async (req, res) => {
    const { _id, imgURL, imgConstraints } = req.body;

    let userExistingImg = await User.findOne({ _id }).select('profileImg');

    userExistingImg.profileImg['url'] = imgURL;
    userExistingImg.profileImg['constraints'] = imgConstraints;


    await User.updateOne({ _id }, { profileImg: userExistingImg.profileImg }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseUpdatedProfilePic = await User.findOne({ _id });

    console.log(responseUpdatedProfilePic);

    res.status(200).json({
        status: 'Success',
        responseUpdatedProfilePic,
    })

})

/*
router
    .route('/settings/changeLastName')
    .post(settingsController.userChangeLastName);

router
    .route('/settings/changeFirstName')
    .post(settingsController.userChangeFirstName);

router
    .route('/settings/changeUserName')
    .post(settingsController.userChangeUserName);

router
    .route('/settings/changeEmailAddress')
    .post(settingsController.userChangeLastName);


*/

exports.userChangeLastName = handleAsync(async(req, res) => {
    const { _id, newLastName } = req.body;

    let existingUser = await User.findOne({ _id });
    existingUser['lastName'] = newLastName;

    await User.updateOne({ _id }, { lastName: existingUser.lastName }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedLastNameUser = await User.findOne({ _id });

    res.status(200).json({
        status: 'Success',
        updatedLastNameUser
    })

})


exports.userChangeFirstName = handleAsync(async(req, res) => {
    const { _id, newFirstName } = req.body;

    let existingUser = await User.findOne({ _id });
    existingUser['firstName'] = newFirstName;

    await User.updateOne({ _id }, { firstName: existingUser.firstName }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedFirstNameUser = await User.findOne({ _id });

    res.status(200).json({
        status: 'Success',
        updatedFirstNameUser
    })

})
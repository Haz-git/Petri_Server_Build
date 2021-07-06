const bcrypt = require('bcryptjs');

//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');

exports.getProfilePicture = handleAsync(async (req, res) => {
    const { _id } = req.body;

    const existingUser = await User.findOne({ _id });
    const { firstName, lastName, userName, email, profileImg } = existingUser;

    res.status(200).json({
        status: 'Success',
        existingUser : {
            _id,
            firstName,
            lastName,
            userName,
            email,
            profileImg,
        }
    });

});


exports.addProfilePicToUser = handleAsync(async (req, res) => {
    const { _id, imgURL, imgConstraints } = req.body;

    let userExistingImg = await User.findOne({ _id }).select('profileImg');

    userExistingImg.profileImg['url'] = imgURL;
    userExistingImg.profileImg['constraints'] = imgConstraints;


    await User.updateOne({ _id }, { profileImg: userExistingImg.profileImg }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseUpdatedProfilePic = await User.findOne({ _id });

    const { firstName, lastName, userName, email, profileImg } = responseUpdatedProfilePic;

    res.status(200).json({
        status: 'Success',
        responseUpdatedProfilePic : {
            _id,
            firstName,
            lastName,
            userName,
            email,
            profileImg,
        }
    });

});

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

exports.userChangePassword = handleAsync(async(req, res) => {
    const { newPassword, newPasswordConfirm, currentPassword, _id } = req.body;

    let existingUser = await User.findOne({ _id });
    
    if (newPassword !== '' && newPasswordConfirm !== '' && currentPassword !== '') {
        existingUser.comparePasswords(currentPassword, existingUser.password).then(async (isValid) => {
            if (isValid) {
                if (newPassword === newPasswordConfirm) {

                    const newSavedPassword = await bcrypt.hash(newPassword, 12);

                    await User.updateOne({ _id: _id}, { password: newSavedPassword }, { bypassDocumentValidation: true }, (err) => {
                        if (err) console.log(err);
                    });

                    res.status(200).json({
                        status: 'Success',
                        msg: 'Your user password has been updated.'
                    })
                } else {
                    res.status(401).json({
                        status: 'Failed',
                        msg: 'Your new passwords do not match'
                    });
                }
            } else {

                res.status(401).json({
                    status: 'Failed',
                    msg: 'Your password does not match the current password.'
                });
            }
        });
    } else {
        //If reaches here, something wrong occurred.
        res.status(500).json({
            msg: 'Error. The server was unable to handle your request',
        });
    }

})

exports.userChangeLastName = handleAsync(async(req, res) => {
    const { _id, newLastName } = req.body;

    let existingUser = await User.findOne({ _id });
    existingUser['lastName'] = newLastName;

    await User.updateOne({ _id }, { lastName: existingUser.lastName }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedLastNameUser = await User.findOne({ _id });
    const { firstName, lastName, userName, email, profileImg } = updatedLastNameUser;

    res.status(200).json({
        status: 'Success',
        updatedLastNameUser: {
            _id,
            firstName,
            lastName,
            userName,
            email,
            profileImg,
        }
    });

});


exports.userChangeFirstName = handleAsync(async(req, res) => {
    const { _id, newFirstName } = req.body;

    let existingUser = await User.findOne({ _id });
    existingUser['firstName'] = newFirstName;

    await User.updateOne({ _id }, { firstName: existingUser.firstName }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedFirstNameUser = await User.findOne({ _id });
    const { firstName, lastName, userName, email, profileImg } = updatedFirstNameUser;

    res.status(200).json({
        status: 'Success',
        updatedFirstNameUser: {
            _id,
            firstName,
            lastName,
            userName,
            email,
            profileImg,
        }
    });

});

exports.userChangeUserName = handleAsync(async(req, res) => {
    const { _id, newUserName } = req.body;

    let existingUser = await User.findOne({ _id });
    existingUser['userName'] = newUserName;

    await User.updateOne({ _id }, { userName: existingUser.userName }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedUserNameUser = await User.findOne({ _id });
    const { firstName, lastName, userName, email, profileImg } = updatedUserNameUser;

    res.status(200).json({
        status: 'Success',
        updatedUserNameUser: {
            _id,
            firstName,
            lastName,
            userName,
            email,
            profileImg,
        }
    });

});

exports.userChangeEmail = handleAsync(async(req, res) => {
    const { _id, newEmailAddress } = req.body;

    let existingUser = await User.findOne({ _id });
    existingUser['email'] = newEmailAddress;

    await User.updateOne({ _id }, { email: existingUser.email }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedEmailAddressUser = await User.findOne({ _id });
    const { firstName, lastName, userName, email, profileImg } = updatedEmailAddressUser;

    res.status(200).json({
        status: 'Success',
        updatedEmailAddressUser: {
            _id,
            firstName,
            lastName,
            userName,
            email,
            profileImg,
        }
    });

});
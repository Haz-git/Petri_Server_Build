//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');
const { response } = require("express");


exports.addProfilePicToUser = handleAsync(async (req, res) => {
    const { _id, imgURL, imgConstraints } = req.body;

    let userExistingImg = await User.findOne({ _id }).select('profileImg');

    userExistingImg.profileImg['url'] = imgURL;
    userExistingImg.profileImg['constraints'] = imgConstraints;


    await User.updateOne({ _id }, { profileImg: userExistingImg.profileImg }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseUpdatedProfilePic = await User.findOne({ _id }).select('profileImg');

    console.log(responseUpdatedProfilePic);

    res.status(200).json({
        status: 'Success',
        responseUpdatedProfilePic,
    })

})
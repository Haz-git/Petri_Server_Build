//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');


exports.addProfilePicToUser = handleAsync(async (req, res) => {
    const { _id, imgURL, imgConstraints } = req.body;

    console.log(_id, imgURL, imgConstraints);
})
//Helper Function:
const handleAsync = require("../utils/handleAsync");

//Model:
const User = require('../models/userModels');

//TimeStamp:
const dayjs = require('dayjs');

//uuid:

const { v4: uuid } = require('uuid');
const { collection } = require("../models/userModels");

//Controller Functions:

exports.addNewProtocol = handleAsync(async (req, res) => {

    const { protocolName, _id } = req.body;

    const userExistingProtocols = await User.findOne({ _id }).select('laczAssayProtocols');

    const timeStamp = dayjs();

    userExistingProtocols.laczAssayProtocols.push({
        protocolName,
        protocolId: uuid(),
        timeStamp: timeStamp.format('MM/DD/YYYY'),
    });

    await User.updateOne({ _id }, { laczAssayProtocols: userExistingProtocols.laczAssayProtocols }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseProtocolList = await User.findOne({ _id }).select('laczAssayProtocols');


    res.status(200).json({
        status: 'Success',
        laczAssayProtocols: responseProtocolList.laczAssayProtocols,
    })
})

exports.getAllProtocols = handleAsync(async (req, res) => {

    const { _id } = req.body;

    const userGetProtocolList = await User.findOne({ _id }).select('laczAssayProtocols');

    res.status(200).json({
        status: 'Success',
        laczAssayProtocols: userGetProtocolList.laczAssayProtocols,
    })
})

exports.editProtocolName = handleAsync(async (req,res) => {
    const { currentProtocolId, newProtocolName, _id } = req.body;

    const userExistingProtocols = await User.findOne({ _id }).select('laczAssayProtocols');

    //Look for currentProtocolId match in array of objects:

    userExistingProtocols.laczAssayProtocols.find(x => x.protocolId === currentProtocolId)['protocolName'] = newProtocolName;

    await User.updateOne({ _id }, { laczAssayProtocols: userExistingProtocols.laczAssayProtocols }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseUpdatedProtocolList = await User.findOne({ _id }).select('laczAssayProtocols');

    res.status(200).json({
        status: 'Success',
        laczAssayProtocols: responseUpdatedProtocolList.laczAssayProtocols,
    });
});

exports.deleteProtocol = handleAsync(async (req, res) => {
    const { currentProtocolId, _id } = req.body;

    const userExistingProtocols = await User.findOne({ _id }).select('laczAssayProtocols');


    userExistingProtocols.laczAssayProtocols.splice(userExistingProtocols.laczAssayProtocols.findIndex(x => x.protocolId === currentProtocolId), 1);

    await User.updateOne({ _id }, { laczAssayProtocols: userExistingProtocols.laczAssayProtocols }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseUpdatedProtocolList = await User.findOne({ _id }).select('laczAssayProtocols');

    res.status(200).json({
        status: 'Success',
        laczAssayProtocols: responseUpdatedProtocolList.laczAssayProtocols,
    });
})

//Controller Functions for Strain Manipulation in Collections:

exports.addStrainToCollection = handleAsync(async(req, res) => {
    const { collectionsObject, currentProtocolId, _id} = req.body;

    //Find Protocols
    let userExistingProtocols = await User.findOne({ _id }).select('laczAssayProtocols');

    const targetIndex = userExistingProtocols.laczAssayProtocols.findIndex(item => item.protocolId === currentProtocolId);

    if(userExistingProtocols.laczAssayProtocols[targetIndex].hasOwnProperty('collectionStrains')) {
        userExistingProtocols.laczAssayProtocols[targetIndex].collectionStrains.push(collectionsObject);
    } else {
        userExistingProtocols.laczAssayProtocols[targetIndex].collectionStrains = [collectionsObject];
    }

    await User.updateOne({ _id }, { laczAssayProtocols: userExistingProtocols.laczAssayProtocols }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseUpdatedProtocolList = await User.findOne({ _id }).select('laczAssayProtocols');

    res.status(200).json({
        status: 'Success',
        laczAssayProtocols: responseUpdatedProtocolList.laczAssayProtocols,
    });
})

exports.deleteStrainFromCollection = handleAsync(async(req,res) => {
    const { _id, currentStrainId, currentProtocolId } = req.body;

    let userExistingProtocols = await User.findOne({ _id }).select('laczAssayProtocols');

    const targetIndex = userExistingProtocols.laczAssayProtocols.findIndex(item => item.protocolId === currentProtocolId);

    const strainIndex = userExistingProtocols.laczAssayProtocols[targetIndex].collectionStrains.findIndex(strain => strain.strainId === currentStrainId);

    userExistingProtocols.laczAssayProtocols[targetIndex].collectionStrains.splice(strainIndex, 1);

    await User.updateOne({ _id }, { laczAssayProtocols: userExistingProtocols.laczAssayProtocols }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseUpdatedProtocolListDeletedStrain = await User.findOne({ _id }).select('laczAssayProtocols');

    res.status(200).json({
        status: 'Success',
        laczAssayProtocols: responseUpdatedProtocolListDeletedStrain.laczAssayProtocols,
    });
})

exports.addCollectionDataToStrain = handleAsync(async (req, res) => {
    const { _id, currentStrainId, currentProtocolId, collectionData } = req.body;

    let userExistingProtocols = await User.findOne({ _id }).select('laczAssayProtocols');

    const targetIndex = userExistingProtocols.laczAssayProtocols.findIndex(item => item.protocolId === currentProtocolId);

    const strainIndex = userExistingProtocols.laczAssayProtocols[targetIndex].collectionStrains.findIndex(strain => strain.strainId === currentStrainId);

    userExistingProtocols.laczAssayProtocols[targetIndex].collectionStrains[strainIndex]['collectionData'] = collectionData;

    await User.updateOne({ _id }, { laczAssayProtocols: userExistingProtocols.laczAssayProtocols }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseUpdatedProtocolListUpdatedCollectionData = await User.findOne({ _id }).select('laczAssayProtocols');

    res.status(200).json({
        status: 'Success',
        laczAssayProtocols: responseUpdatedProtocolListUpdatedCollectionData.laczAssayProtocols,
    });
})

exports.updateParsedDataToStrain = handleAsync(async(req, res) => {
    const { _id, currentProtocolId, parsedData } = req.body;

    let userExistingProtocols = await User.findOne({ _id }).select('laczAssayProtocols');

    const targetIndex = userExistingProtocols.laczAssayProtocols.findIndex(item => item.protocolId === currentProtocolId);

    userExistingProtocols.laczAssayProtocols[targetIndex]['collectionStrains'] = parsedData;

    await User.updateOne({ _id }, { laczAssayProtocols: userExistingProtocols.laczAssayProtocols }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const updatedCollectionStrainData = await User.findOne({ _id }).select('laczAssayProtocols');

    res.status(200).json({
        status: 'Success',
        laczAssayProtocols: updatedCollectionStrainData.laczAssayProtocols,
    });

});

exports.addLacZDataToStrain = handleAsync(async(req, res) => {
    const { _id, currentStrainId, currentProtocolId, lacZData } = req.body;

    let userExistingProtocols = await User.findOne({ _id }).select('laczAssayProtocols');

    const targetIndex = userExistingProtocols.laczAssayProtocols.findIndex(item => item.protocolId === currentProtocolId);

    const strainIndex = userExistingProtocols.laczAssayProtocols[targetIndex].collectionStrains.findIndex(strain => strain.strainId === currentStrainId);

    userExistingProtocols.laczAssayProtocols[targetIndex].collectionStrains[strainIndex]['lacZData'] = lacZData;

    await User.updateOne({ _id }, { laczAssayProtocols: userExistingProtocols.laczAssayProtocols }, { bypassDocumentValidation: true}, (err) => {
        if (err) console.log(err);
    });

    const responseUpdatedLacZData = await User.findOne({ _id }).select('laczAssayProtocols');

    res.status(200).json({
        status: 'Success',
        laczAssayProtocols: responseUpdatedLacZData.laczAssayProtocols,
    })
})
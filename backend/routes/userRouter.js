const express = require('express');
const router = express.Router();

//Authentication Function:
const authJWT = require('../controllers/authControllers');
const authenticateJWT = authJWT.authenticateJWT;

//Controllers:
const authController = require('../controllers/authControllers');
const chatController = require('../controllers/chatController');
const taskController = require('../controllers/taskController');
const bionoteController = require('../controllers/bionoteController');
const folderController = require('../controllers/folderControllers');
const calendarController = require('../controllers/calendarController');
const laczController = require('../controllers/laczController');
const settingsController = require('../controllers/settingsController');

//Authentication Routers:
router
    .route('/signup')
    .post(authController.signup);

router
    .route('/login')
    .post(authController.login);

// router
//     .route('/logout')
//     .get(authController.logout);



//Global Chat Router:

router
    .route('/chats')
    .get(authenticateJWT, chatController.chatLogs);
    
//Personal User Task Router:

router
    .route('/task')
    .post(authenticateJWT, taskController.addTask);

router
    .route('/getTasks')
    .post(authenticateJWT, taskController.getTasks);

router
    .route('/task/delete')
    .post(authenticateJWT, taskController.deleteTask);

//Personal User Folder Router:
router
    .route('/notebook/folder/create')
    .post(authenticateJWT, folderController.addFolder);

router
    .route('/notebook/folder/delete')
    .post(authenticateJWT, folderController.deleteFolder);

router
    .route('/notebook/folder/edit')
    .post(authenticateJWT, folderController.renameFolder);

router
    .route('/notebook/folder/get')
    .post(authenticateJWT, folderController.getFolders);

//Personal User BioNote Router:

router
    .route('/bionote/create')
    .post(authenticateJWT, bionoteController.addBioNote);

router
    .route('/bionote/load')
    .post(authenticateJWT, bionoteController.getBioNotes);

router
    .route('/bionote/update')
    .patch(authenticateJWT, bionoteController.updateBioNote);

router
    .route('/bionote/delete')
    .patch(authenticateJWT, bionoteController.deleteBioNote);

//Personal Calendar Router:

router
    .route('/calendar/new')
    .post(authenticateJWT, calendarController.addNewEvent);

router
    .route('/calendar/events')
    .post(authenticateJWT, calendarController.getAllEvents);

router
    .route('/calendar/delete')
    .post(authenticateJWT, calendarController.deleteEvent);

router
    .route('/calendar/update')
    .patch(authenticateJWT, calendarController.updateEvent);

//Personal Scitools Router:

router
    .route('/scitools/lacz/add')
    .post(authenticateJWT, laczController.addNewProtocol);

router
    .route('/scitools/lacz/get')
    .post(authenticateJWT, laczController.getAllProtocols);

router
    .route('/scitools/lacz/edit')
    .patch(authenticateJWT, laczController.editProtocolName);

router
    .route('/scitools/lacz/delete')
    .post(authenticateJWT, laczController.deleteProtocol);

router
    .route('/scitools/lacz/collection/addStrainToCollection')
    .post(authenticateJWT, laczController.addStrainToCollection);

router
    .route('/scitools/lacz/collection/deleteStrain')
    .post(authenticateJWT, laczController.deleteStrainFromCollection);

//Route to modify collection data for a certain strain:

router
    .route('/scitools/lacz/collection/addCollectionData')
    .post(authenticateJWT, laczController.addCollectionDataToStrain);

router
    .route('/scitools/lacz/collection/updateParsedData')
    .post(authenticateJWT, laczController.updateParsedDataToStrain);

router
    .route('/scitools/lacz/laczdata/addLacZData')
    .post(authenticateJWT, laczController.addLacZDataToStrain);

router
    .route('/scitools/lacz/laczdata/addbgaldata')
    .post(authenticateJWT, laczController.addBgalDataToStrain);


//Personal User Settings Router:

router
    .route('/settings/setNewProPic')
    .post(authenticateJWT, settingsController.addProfilePicToUser);
router
    .route('/settings/getProPic')
    .post(authenticateJWT, settingsController.getProfilePicture);

//Routes for User To Change Personal Information:

router
    .route('/settings/changeLastName')
    .post(authenticateJWT, settingsController.userChangeLastName);

router
    .route('/settings/changeFirstName')
    .post(authenticateJWT, settingsController.userChangeFirstName);

router
    .route('/settings/changeUserName')
    .post(authenticateJWT, settingsController.userChangeUserName);

router
    .route('/settings/changeEmailAddress')
    .post(authenticateJWT, settingsController.userChangeEmail);

router
    .route('/settings/changePassword')
    .post(authenticateJWT, settingsController.userChangePassword);

module.exports = router;
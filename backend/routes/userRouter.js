const express = require('express');
const { route } = require('../app');
const router = express.Router();

//Controllers:
const authController = require('../controllers/authControllers');
const chatController = require('../controllers/chatController');
const taskController = require('../controllers/taskController');
const bionoteController = require('../controllers/bionoteController');
const calendarController = require('../controllers/calendarController');
const laczController = require('../controllers/laczController');

//Authentication Routers:
router
    .route('/signup')
    .post(authController.signup);

router
    .route('/login')
    .post(authController.login);

router
    .route('/logout')
    .get(authController.logout);



//Global Chat Router:

router
    .route('/chats')
    .get(chatController.chatLogs);
    
//Personal User Task Router:

router
    .route('/task')
    .post(taskController.addTask);

router
    .route('/getTasks')
    .post(taskController.getTasks);

router
    .route('/task/delete')
    .post(taskController.deleteTask);

//Personal User BioNote Router:

router
    .route('/bionote/create')
    .post(bionoteController.addBioNote)

router
    .route('/bionote/load')
    .post(bionoteController.getBioNotes);

router
    .route('/bionote/update')
    .patch(bionoteController.updateBioNote);

router
    .route('/bionote/delete')
    .patch(bionoteController.deleteBioNote);

//Personal Calendar Router:

router
    .route('/calendar/new')
    .post(calendarController.addNewEvent);

router
    .route('/calendar/events')
    .post(calendarController.getAllEvents);

router
    .route('/calendar/delete')
    .post(calendarController.deleteEvent);

router
    .route('/calendar/update')
    .patch(calendarController.updateEvent);

//Personal Scitools Router:

router
    .route('/scitools/lacz/add')
    .post(laczController.addNewProtocol);

router
    .route('/scitools/lacz/get')
    .post(laczController.getAllProtocols);

router
    .route('/scitools/lacz/edit')
    .patch(laczController.editProtocolName);

router
    .route('/scitools/lacz/delete')
    .post(laczController.deleteProtocol);

router
    .route('/scitools/lacz/collection/addStrainToCollection')
    .post(laczController.addStrainToCollection);

router
    .route('/scitools/lacz/collection/deleteStrain')
    .post(laczController.deleteStrainFromCollection);

//Route to modify collection data for a certain strain:

router
    .route('/scitools/lacz/collection/addCollectionData')
    .post(laczController.addCollectionDataToStrain);

router
    .route('/scitools/lacz/collection/updateParsedData')
    .post(laczController.updateParsedDataToStrain);

router
    .route('/scitools/lacz/laczdata/addLacZData')
    .post(laczController.addLacZDataToStrain);


module.exports = router;
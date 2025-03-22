const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const verifyToken = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(verifyToken);

// Session routes
router.post('/create', sessionController.createSession);
router.post('/join', sessionController.joinSession);
router.get('/active', sessionController.getActiveSessions);
router.put('/end/:sessionId', sessionController.endSession);

module.exports = router;
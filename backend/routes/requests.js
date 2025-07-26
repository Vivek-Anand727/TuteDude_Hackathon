const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Post a new request (only vendors or group leaders allowed)
router.post(
  '/create',
  authenticate,
  checkRole('vendor'), // or 'leader' if you have that role separately
  requestController.createRequest
);

// Get all requests created by current user or their groups
router.get(
  '/my-requests',
  authenticate,
  requestController.getMyRequests
);

// Get all requests for a specific group
router.get(
  '/group/:groupId',
  authenticate,
  requestController.getRequestsByGroup
);

// Delete a request (only if created by the user)
router.delete(
  '/:requestId',
  authenticate,
  requestController.deleteRequest
);

module.exports = router;

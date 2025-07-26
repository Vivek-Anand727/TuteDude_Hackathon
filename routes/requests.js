const express = require('express');
const router = express.Router();

// Post a new request (by buyer or group leader)
router.post('/create', (req, res) => {
  // controller: requestController.createRequest
});

// Get all requests created by current user or their group
router.get('/my-requests', (req, res) => {
  // controller: requestController.getMyRequests
});

// Get all requests for a specific group
router.get('/group/:groupId', (req, res) => {
  // controller: requestController.getRequestsByGroup
});

// (Optional) Delete a request
router.delete('/:requestId', (req, res) => {
  // controller: requestController.deleteRequest
});

module.exports = router;

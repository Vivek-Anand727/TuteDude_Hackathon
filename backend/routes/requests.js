// routes/requests.js (Fixed Request Routes)
const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authenticate = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// ====== INDIVIDUAL REQUEST MANAGEMENT ======

// Create a new individual request (only vendors)
router.post('/create', requestController.createRequest);

// Get vendor's own requests with filters
router.get('/my-requests', requestController.getMyRequests);

// Get all open requests (for suppliers to browse)
router.get('/browse', requestController.getAllOpenRequests);

// Get request statistics (for vendor dashboard) - MOVED BEFORE /:requestId
router.get('/stats/dashboard', requestController.getRequestStats);

// Get specific request details
router.get('/:requestId', requestController.getRequestById);

// Update request details (only request owner)
router.patch('/update/:requestId', requestController.updateRequest);

// Close/expire a request (only request owner)
router.patch('/close/:requestId', requestController.closeRequest);

// Delete a request (only request owner)
router.delete('/:requestId', requestController.deleteRequest);

module.exports = router;

// Your routes/requests.js has: require('../middleware/auth') 
// But the file should be: require('../middleware/authMiddleware')

// File: routes/requests.js (CORRECTED)
const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authenticate = require('../middleware/authMiddleware'); // FIXED: was '../middleware/auth'
const checkRole = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authenticate);

// Create a new individual request (only vendors)
router.post('/create', checkRole('vendor'), requestController.createRequest);

// Get vendor's own requests with filters
router.get('/my-requests', checkRole('vendor'), requestController.getMyRequests);

// Get all open requests (for suppliers to browse)
router.get('/browse', checkRole('supplier'), requestController.getAllOpenRequests);

// Get request statistics - MOVED BEFORE /:requestId to avoid conflicts
router.get('/stats/dashboard', checkRole('vendor'), requestController.getRequestStats);

// Get specific request details
router.get('/:requestId', requestController.getRequestById);

// Update request details (only request owner)
router.patch('/update/:requestId', checkRole('vendor'), requestController.updateRequest);

// Close/expire a request (only request owner)
router.patch('/close/:requestId', checkRole('vendor'), requestController.closeRequest);

// Delete a request (only request owner)
router.delete('/:requestId', checkRole('vendor'), requestController.deleteRequest);

module.exports = router;
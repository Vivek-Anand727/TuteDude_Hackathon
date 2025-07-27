const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const groupOfferController = require('../controllers/groupOfferController');
const authenticate = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Debug middleware for groups routes
router.use((req, res, next) => {
  console.log('\n🔄 Groups router hit:');
  console.log('   Method:', req.method);
  console.log('   Path:', req.path);
  console.log('   Full URL:', req.originalUrl);
  next();
});

// ====== TEST ROUTES (BEFORE AUTHENTICATION) ======
router.get('/test-simple', (req, res) => {
  console.log('✅ Simple test route hit successfully');
  res.json({
    success: true,
    message: 'Groups router is accessible',
    timestamp: new Date().toISOString()
  });
});

// ====== SPECIFIC ROUTES (BEFORE WILDCARD ROUTES) ======
// All routes below require authentication
router.use(authenticate);

// Test routes with auth
router.get('/test-auth', (req, res) => {
  console.log('✅ Auth test route hit successfully');
  res.json({
    success: true,
    message: 'Authentication working',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

router.get('/test-vendor', checkRole('vendor'), (req, res) => {
  console.log('✅ Vendor test route hit successfully');
  res.json({
    success: true,
    message: 'Vendor role check working',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// ====== GROUP MANAGEMENT SPECIFIC ROUTES ======
// Create a new group (vendors only)
router.post('/create', checkRole('vendor'), groupController.createGroup);

// Get user's groups
router.get('/my-groups', groupController.getMyGroups);

// Get available groups to join
router.get('/available', groupController.getAvailableGroups);

// ====== GROUP OFFERS SPECIFIC ROUTES ======
// Get all active group requests (for suppliers)
router.get('/requests/active', groupOfferController.getActiveGroupRequests);

// Create a group offer (suppliers only)
router.post('/offers/create', checkRole('supplier'), groupOfferController.createGroupOffer);

// Get supplier's own offers
router.get('/offers/my-offers', checkRole('supplier'), groupOfferController.getMyGroupOffers);

// ====== GROUP REQUEST SPECIFIC ROUTES ======
// Get offers for a specific group request (group leader)
router.get('/requests/:groupRequestId/offers', groupOfferController.getGroupOffersForRequest);

// Accept an offer (group leader only)
router.post('/offers/:offerId/accept', checkRole('vendor'), groupOfferController.acceptGroupOffer);

// Counter an offer (group leader only)
router.post('/offers/:offerId/counter', checkRole('vendor'), groupOfferController.counterGroupOffer);

// Respond to counter offer (supplier only)
router.post('/offers/:offerId/respond', checkRole('supplier'), groupOfferController.respondToCounter);

// ====== WILDCARD ROUTES (MUST BE LAST) ======
// Get specific group details
router.get('/:groupId', groupController.getGroupDetails);

// Join a group
router.post('/:groupId/join', checkRole('vendor'), groupController.joinGroup);

// Leave a group
router.post('/:groupId/leave', groupController.leaveGroup);

// Assign new leader
router.post('/:groupId/assign-leader', checkRole('vendor'), groupController.assignLeader);

// Create group request (only group leader)
router.post('/:groupId/create-request', checkRole('vendor'), groupController.createGroupRequest);

// Get group request details
router.get('/:groupId/request', groupController.getGroupRequest);

module.exports = router;

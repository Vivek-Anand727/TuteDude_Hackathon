// routes/offers.js
const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const authenticate = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authenticate);

// ====== INDIVIDUAL OFFERS MANAGEMENT ======

// Create new offer (suppliers only)
router.post('/create', checkRole('supplier'), offerController.createOffer);

// Get all offers for a specific request (for vendors)
router.get('/request/:requestId', checkRole('vendor'), offerController.getOffersForRequest);

// Get supplier's own offers
router.get('/my-offers', checkRole('supplier'), offerController.getMyOffers);

// Get all open requests (for suppliers to browse and bid)
router.get('/browse-requests', checkRole('supplier'), offerController.getOpenRequests);

// Accept an offer (vendors only)
router.post('/:offerId/accept', checkRole('vendor'), offerController.acceptOffer);

// Reject an offer (vendors only) 
router.post('/:offerId/reject', checkRole('vendor'), offerController.rejectOffer);

    // Counter offer (vendors only)
    router.post('/:offerId/counter', checkRole('vendor'), offerController.counterOffer);

// Supplier responds to counter offer
router.post('/:offerId/respond-counter', checkRole('supplier'), offerController.respondToCounter);

// ====== GROUP OFFERS MANAGEMENT ======

// Create group offer (suppliers only)
router.post('/group/create', checkRole('supplier'), require('../controllers/groupOfferController').createGroupOffer);
// Get all offers for a group request (for group leaders)
router.get('/group/request/:groupRequestId', checkRole('vendor'), require('../controllers/groupOfferController').getGroupOffersForRequest);

// Get supplier's group offers
router.get('/group/my-offers', checkRole('supplier'), require('../controllers/groupOfferController').getMyGroupOffers);

// Get all active group requests (for suppliers to browse)
router.get('/group/browse-requests', checkRole('supplier'), require('../controllers/groupOfferController').getActiveGroupRequests);

// Accept group offer (group leaders only)
router.post('/group/:offerId/accept', checkRole('vendor'), require('../controllers/groupOfferController').acceptGroupOffer);

// Counter group offer (group leaders only)
router.post('/group/:offerId/counter', checkRole('vendor'), require('../controllers/groupOfferController').counterGroupOffer);

// Supplier responds to group counter offer  
router.post('/group/:offerId/respond-counter', checkRole('supplier'), require('../controllers/groupOfferController').respondToCounter);

module.exports = router;
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');


const offerController = require('../controllers/offerController');
const groupOfferController = require('../controllers/groupOfferController');

// ====== Individual Offers ======

// Seller makes an individual offer
router.post('/create', authenticate, offerController.createOffer);

// Buyer or leader accepts individual offer
router.post('/accept/:offerId', authenticate, offerController.acceptOffer);

// Counter offer (negotiation) for individual offer
router.patch('/counter/:offerId', authenticate, offerController.counterOffer);

// Get all individual offers for a specific request
router.get('/request/:requestId', authenticate, offerController.getOffersForRequest);


// ====== Group Offers ======
router.post('/group/create', authenticate, groupOfferController.createGroupOffer);
router.post('/group/accept/:offerId', authenticate, groupOfferController.acceptGroupOffer);
router.patch('/group/counter/:offerId', authenticate, groupOfferController.counterGroupOffer);
router.get('/group/request/:requestId', authenticate, groupOfferController.getGroupOffersForRequest);


module.exports = router;

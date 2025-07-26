const express = require('express');
const router = express.Router();

const offerController = require('../controllers/offerController');
const groupOfferController = require('../controllers/groupOfferController');

// ====== Individual Offers ======

// Seller makes an individual offer
router.post('/create', offerController.createOffer);

// Buyer or leader accepts individual offer
router.post('/accept/:offerId', offerController.acceptOffer);

// Counter offer (negotiation) for individual offer
router.patch('/counter/:offerId', offerController.counterOffer);

// Get all individual offers for a specific request
router.get('/request/:requestId', offerController.getOffersForRequest);


// ====== Group Offers ======

// Seller makes a group offer
router.post('/group/create', groupOfferController.createGroupOffer);

// Group leader accepts the group offer
router.post('/group/accept/:offerId', groupOfferController.acceptGroupOffer);

// Group leader sends a counter group offer
router.patch('/group/counter/:offerId', groupOfferController.counterGroupOffer);

// View all group offers for a specific request
router.get('/group/request/:requestId', groupOfferController.getGroupOffersForRequest);


module.exports = router;

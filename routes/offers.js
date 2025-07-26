const express = require('express');
const router = express.Router();

// Seller makes an offer
router.post('/create', (req, res) => {
  // controller: offerController.createOffer
});

// Group leader or buyer accepts the offer
router.post('/accept/:offerId', (req, res) => {
  // controller: offerController.acceptOffer
});

// Seller or buyer sends a counter offer (negotiation)
router.patch('/counter/:offerId', (req, res) => {
  // controller: offerController.counterOffer
});

// View all offers for a specific request
router.get('/request/:requestId', (req, res) => {
  // controller: offerController.getOffersForRequest
});

module.exports = router;

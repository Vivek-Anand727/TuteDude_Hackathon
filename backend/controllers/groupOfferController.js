const GroupOffer = require('../models/GroupOffer');
const Request = require('../models/Request');

// Seller makes a group offer
exports.createGroupOffer = async (req, res) => {
  try {
    const { requestId, sellerId, price, quantity, message } = req.body;

    const newOffer = new GroupOffer({
      request: requestId,
      seller: sellerId,
      price,
      quantity,
      message,
      status: 'pending'
    });

    await newOffer.save();
    res.status(201).json({ success: true, offer: newOffer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Group leader accepts offer
exports.acceptGroupOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;

    const offer = await GroupOffer.findById(offerId);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    offer.status = 'accepted';
    await offer.save();

    res.status(200).json({ success: true, message: 'Group offer accepted', offer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Send a counter offer (by leader)
exports.counterGroupOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const { price, quantity, message } = req.body;

    const offer = await GroupOffer.findById(offerId);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    offer.price = price || offer.price;
    offer.quantity = quantity || offer.quantity;
    offer.message = message || offer.message;
    offer.status = 'countered';

    await offer.save();
    res.status(200).json({ success: true, message: 'Counter offer sent', offer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all offers for a group request
exports.getGroupOffersForRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const offers = await GroupOffer.find({ request: requestId }).populate('seller');

    res.status(200).json({ success: true, offers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

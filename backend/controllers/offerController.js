const Offer = require('../models/Offer');
const Request = require('../models/Request');

// Create a new offer (by seller)
exports.createOffer = async (req, res) => {
  try {
    const { requestId, price, message, deliveryTime, minOrderQty } = req.body;

    const offer = new Offer({
      requestId,
      seller: req.user._id,
      price,
      message,
      deliveryTime,
      minOrderQty,
    });

    await offer.save();
    res.status(201).json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating offer', error });
  }
};

// Accept an offer (by buyer or group leader)
exports.acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    offer.status = 'accepted';
    await offer.save();

    res.status(200).json({ success: true, message: 'Offer accepted', offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error accepting offer', error });
  }
};

// Counter offer (negotiation from either side)
exports.counterOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { price, message, deliveryTime } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Only buyer or seller involved can counter
    if (!offer.seller.equals(req.user._id) && !offer.buyer?.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to negotiate' });
    }

    offer.price = price || offer.price;
    offer.message = message || offer.message;
    offer.deliveryTime = deliveryTime || offer.deliveryTime;
    offer.status = 'pending';

    await offer.save();

    res.status(200).json({ success: true, message: 'Counter offer sent', offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending counter offer', error });
  }
};

// Get all offers for a request
exports.getOffersForRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const offers = await Offer.find({ requestId }).populate('seller', 'name email');

    res.status(200).json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching offers', error });
  }
};

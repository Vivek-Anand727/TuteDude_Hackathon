const Offer = require('../models/Offer');

// Create a new offer (by supplier)
exports.createOffer = async (req, res) => {
  try {
    const { requestId, offeredPrice, eta, notes } = req.body;

    if (!requestId || !offeredPrice || !eta) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const offer = new Offer({
      request: requestId,
      supplier: req.user._id, // assuming req.user is injected by auth middleware
      offeredPrice,
      eta,
      notes,
    });

    await offer.save();
    res.status(201).json({ success: true, offer });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ success: false, message: 'Error creating offer', error });
  }
};

// Accept an offer
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
    console.error('Error accepting offer:', error);
    res.status(500).json({ success: false, message: 'Error accepting offer', error });
  }
};

// Counter offer (from either buyer or supplier)
exports.counterOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { offeredPrice, eta, notes } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (!offer.supplier.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to counter this offer' });
    }

    offer.offeredPrice = offeredPrice || offer.offeredPrice;
    offer.eta = eta || offer.eta;
    offer.notes = notes || offer.notes;
    offer.status = 'pending';

    await offer.save();
    res.status(200).json({ success: true, message: 'Counter offer sent', offer });
  } catch (error) {
    console.error('Error countering offer:', error);
    res.status(500).json({ success: false, message: 'Error sending counter offer', error });
  }
};

// Get all offers for a specific request
exports.getOffersForRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const offers = await Offer.find({ request: requestId }).populate('supplier', 'name email');
    res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ success: false, message: 'Error fetching offers', error });
  }
};

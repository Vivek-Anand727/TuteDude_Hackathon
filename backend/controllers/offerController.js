// controllers/offerController.js (Individual offers - improved)
const Offer = require('../models/Offer');
const Request = require('../models/Request');

// Create a new offer (by supplier)
exports.createOffer = async (req, res) => {
  try {
    const { requestId, offeredPrice, eta, notes, deliveryOptions } = req.body;

    if (!requestId || !offeredPrice || !eta) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if request exists and is open
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Request is no longer open' });
    }

    // Check if supplier already made an offer for this request
    const existingOffer = await Offer.findOne({ 
      request: requestId, 
      supplier: req.user._id 
    });

    if (existingOffer) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already made an offer for this request. Use counter offer to modify.' 
      });
    }
    
    const offer = new Offer({
      request: requestId,
      supplier: req.user._id,
      offeredPrice,
      eta,
      notes: notes || '',
      deliveryOptions: deliveryOptions || {
        canPickup: true,
        canDeliver: false,
        deliveryCharge: 0
      },
      status: 'pending'
    });

    await offer.save();
    await offer.populate('supplier', 'name email role phone location');

    res.status(201).json({ 
      success: true, 
      message: 'Offer created successfully',
      offer 
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Accept an offer (by vendor)
exports.acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const vendorId = req.user._id;

    const offer = await Offer.findById(offerId).populate('request');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check if the vendor owns the request
    if (offer.request.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Only request owner can accept offers' });
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return res.status(400).json({ success: false, message: 'Offer cannot be accepted in current status' });
    }

    // Accept the offer
    offer.status = 'accepted';
    await offer.save();

    // Update request status and link accepted offer
    const request = await Request.findById(offer.request._id);
    request.status = 'fulfilled';
    request.acceptedOffer = offerId;
    await request.save();

    // Reject all other offers for this request
    await Offer.updateMany(
      { 
        request: offer.request._id,
        _id: { $ne: offerId },
        status: { $in: ['pending', 'countered'] }
      },
      { status: 'rejected' }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Offer accepted successfully', 
      offer 
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Reject an offer (by vendor)
exports.rejectOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const vendorId = req.user._id;

    const offer = await Offer.findById(offerId).populate('request');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check if the vendor owns the request
    if (offer.request.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Only request owner can reject offers' });
    }

    offer.status = 'rejected';
    await offer.save();

    res.status(200).json({ 
      success: true, 
      message: 'Offer rejected successfully', 
      offer 
    });
  } catch (error) {
    console.error('Reject offer error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Counter offer (by vendor to supplier)
exports.counterOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { offeredPrice, eta, notes } = req.body;
    const vendorId = req.user._id;

    const offer = await Offer.findById(offerId).populate('request');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check if the vendor owns the request
    if (offer.request.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Only request owner can counter offers' });
    }

    if (offer.status === 'accepted' || offer.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot counter an already processed offer' });
    }

    // Update offer with counter details
    offer.offeredPrice = offeredPrice || offer.offeredPrice;
    offer.eta = eta || offer.eta;
    offer.notes = notes || offer.notes;
    offer.status = 'countered';

    await offer.save();

    res.status(200).json({ 
      success: true, 
      message: 'Counter offer sent successfully', 
      offer 
    });
  } catch (error) {
    console.error('Counter offer error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Supplier responds to counter offer
exports.respondToCounter = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { action, offeredPrice, eta, notes } = req.body; // action: 'accept' or 'counter'
    const supplierId = req.user._id;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check if user is the supplier
    if (offer.supplier.toString() !== supplierId.toString()) {
      return res.status(403).json({ success: false, message: 'Only supplier can respond to counter offers' });
    }

    if (offer.status !== 'countered') {
      return res.status(400).json({ success: false, message: 'No counter offer to respond to' });
    }

    if (action === 'accept') {
      offer.status = 'pending'; // Vendor can now accept this
    } else if (action === 'counter') {
      offer.offeredPrice = offeredPrice || offer.offeredPrice;
      offer.eta = eta || offer.eta;
      offer.notes = notes || offer.notes;
      offer.status = 'pending';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use "accept" or "counter"' });
    }

    await offer.save();

    res.status(200).json({ 
      success: true, 
      message: `Successfully ${action}ed counter offer`, 
      offer 
    });
  } catch (error) {
    console.error('Respond to counter error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all offers for a specific request (for vendor)
exports.getOffersForRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const vendorId = req.user._id;

    // Verify the vendor owns this request
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Only request owner can view offers' });
    }

    const offers = await Offer.find({ request: requestId })
      .populate('supplier', 'name email role phone location')
      .sort({ createdAt: -1 });

    // Mark offers as viewed by vendor
    await Offer.updateMany(
      { request: requestId, viewedByVendor: false },
      { viewedByVendor: true, viewedAt: new Date() }
    );

    res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error('Get offers for request error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get supplier's own offers
exports.getMyOffers = async (req, res) => {
  try {
    const supplierId = req.user._id;
    const { status } = req.query;

    let filter = { supplier: supplierId };
    if (status) {
      filter.status = status;
    }

    const offers = await Offer.find(filter)
      .populate('request')
      .populate('request.vendor', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error('Get my offers error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all open requests for suppliers to bid on
exports.getOpenRequests = async (req, res) => {
  try {
    const { item, location, minPrice, maxPrice } = req.query;
    
    let filter = { status: 'open' };

    if (item) filter.item = new RegExp(item, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (minPrice) filter.desiredPrice = { ...filter.desiredPrice, $gte: parseInt(minPrice) };
    if (maxPrice) filter.desiredPrice = { ...filter.desiredPrice, $lte: parseInt(maxPrice) };

    const requests = await Request.find(filter)
      .populate('vendor', 'name email phone location')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Get open requests error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete/withdraw offer (by supplier - their own offers only) - MISSING FUNCTION
exports.deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const supplierId = req.user._id;

    const offer = await Offer.findById(offerId).populate('request');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check if the supplier owns this offer
    if (offer.supplier.toString() !== supplierId.toString()) {
      return res.status(403).json({ success: false, message: 'Only offer owner can delete offers' });
    }

    // Can only delete offers that are pending or countered
    if (offer.status === 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete an accepted offer. Contact the vendor to cancel the deal.' 
      });
    }

    // Delete the offer
    await Offer.findByIdAndDelete(offerId);

    res.status(200).json({ 
      success: true, 
      message: 'Offer deleted successfully' 
    });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

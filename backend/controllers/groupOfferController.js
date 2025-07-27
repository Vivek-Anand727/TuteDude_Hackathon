const GroupOffer = require('../models/GroupOffer');
const GroupRequest = require('../models/GroupRequest');
const Group = require('../models/Group');
const User = require('../models/User');

// Supplier creates a group offer
exports.createGroupOffer = async (req, res) => {
  try {
    const { groupRequestId, offeredPrice, eta, notes, deliveryOptions } = req.body;
    const supplierId = req.user._id;

    if (!groupRequestId || !offeredPrice || !eta) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check if group request exists and is active
    const groupRequest = await GroupRequest.findById(groupRequestId).populate('group');
    if (!groupRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group request not found' 
      });
    }

    if (groupRequest.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Group request is not active' 
      });
    }

    // Check if supplier already made an offer
    const existingOffer = await GroupOffer.findOne({
      groupRequest: groupRequestId,
      supplier: supplierId
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'You have already made an offer for this group request'
      });
    }

    // Calculate total price based on quantity
    const quantityMatch = groupRequest.quantity.match(/(\d+(?:\.\d+)?)/);
    const quantityNumber = quantityMatch ? parseFloat(quantityMatch[0]) : 1;
    const totalPrice = offeredPrice * quantityNumber;

    const newOffer = new GroupOffer({
      groupRequest: groupRequestId,
      supplier: supplierId,
      offeredPrice,
      totalPrice,
      eta,
      notes: notes || '',
      deliveryOptions: deliveryOptions || {
        canPickup: true,
        canDeliver: false,
        deliveryCharge: 0
      },
      status: 'pending',
      negotiationHistory: [{
        by: 'supplier',
        action: 'initial_offer',
        offeredPrice,
        totalPrice,
        message: notes || 'Initial offer',
        timestamp: new Date()
      }]
    });

    await newOffer.save();
    await newOffer.populate('supplier', 'name email role phone');

    // Update offers count in group request
    groupRequest.offersCount += 1;
    await groupRequest.save();

    res.status(201).json({ 
      success: true, 
      message: 'Group offer created successfully',
      offer: newOffer 
    });
  } catch (err) {
    console.error("Create group offer error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Group leader accepts offer
exports.acceptGroupOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user._id;

    const offer = await GroupOffer.findById(offerId)
      .populate({
        path: 'groupRequest',
        populate: {
          path: 'group',
          model: 'Group'
        }
      });

    if (!offer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }

    // Check if user is the group leader
    if (offer.groupRequest.group.leader.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only group leader can accept offers' 
      });
    }

    if (offer.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Offer already accepted'
      });
    }

    // Update offer status
    offer.status = 'accepted';
    offer.negotiationHistory.push({
      by: 'leader',
      action: 'accept',
      offeredPrice: offer.offeredPrice,
      totalPrice: offer.totalPrice,
      message: 'Offer accepted by group leader',
      timestamp: new Date()
    });
    await offer.save();

    // Update group request
    const groupRequest = await GroupRequest.findById(offer.groupRequest._id);
    groupRequest.status = 'completed';
    groupRequest.acceptedOffer = offerId;
    await groupRequest.save();

    // Update group status
    const group = await Group.findById(offer.groupRequest.group._id);
    group.status = 'deal_closed';
    await group.save();

    // Reject all other offers for this group request
    await GroupOffer.updateMany(
      { 
        groupRequest: offer.groupRequest._id,
        _id: { $ne: offerId },
        status: { $in: ['pending', 'under_negotiation', 'countered'] }
      },
      { 
        status: 'rejected',
        $push: {
          negotiationHistory: {
            by: 'leader',
            action: 'reject',
            message: 'Another offer was accepted',
            timestamp: new Date()
          }
        }
      }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Group offer accepted successfully', 
      offer 
    });
  } catch (err) {
    console.error("Accept group offer error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Group leader sends counter offer
exports.counterGroupOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { offeredPrice, eta, notes } = req.body;
    const userId = req.user._id;

    const offer = await GroupOffer.findById(offerId)
      .populate({
        path: 'groupRequest',
        populate: {
          path: 'group',
          model: 'Group'
        }
      });

    if (!offer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }

    // Check if user is the group leader
    if (offer.groupRequest.group.leader.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only group leader can counter offers' 
      });
    }

    // Calculate new total price
    const quantityMatch = offer.groupRequest.quantity.match(/(\d+(?:\.\d+)?)/);
    const quantityNumber = quantityMatch ? parseFloat(quantityMatch[0]) : 1;
    const newTotalPrice = (offeredPrice || offer.offeredPrice) * quantityNumber;

    // Update offer with counter details
    offer.offeredPrice = offeredPrice || offer.offeredPrice;
    offer.totalPrice = newTotalPrice;
    offer.eta = eta || offer.eta;
    offer.notes = notes || offer.notes;
    offer.status = 'countered';

    offer.negotiationHistory.push({
      by: 'leader',
      action: 'counter_offer',
      offeredPrice: offer.offeredPrice,
      totalPrice: offer.totalPrice,
      message: notes || 'Counter offer from group leader',
      timestamp: new Date()
    });

    await offer.save();

    res.status(200).json({ 
      success: true, 
      message: 'Counter offer sent successfully', 
      offer 
    });
  } catch (err) {
    console.error("Counter group offer error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Supplier responds to counter offer
exports.respondToCounter = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { action, offeredPrice, eta, notes } = req.body;
    const userId = req.user._id;

    if (!action || !['accept', 'counter'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "accept" or "counter"'
      });
    }

    const offer = await GroupOffer.findById(offerId)
      .populate('groupRequest');
    
    if (!offer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }

    // Check if user is the supplier
    if (offer.supplier.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only supplier can respond to counter offers' 
      });
    }

    if (action === 'accept') {
      offer.status = 'under_negotiation';
      offer.negotiationHistory.push({
        by: 'supplier',
        action: 'accept',
        offeredPrice: offer.offeredPrice,
        totalPrice: offer.totalPrice,
        message: 'Counter offer accepted by supplier',
        timestamp: new Date()
      });
    } else if (action === 'counter') {
      const quantityMatch = offer.groupRequest.quantity.match(/(\d+(?:\.\d+)?)/);
      const quantityNumber = quantityMatch ? parseFloat(quantityMatch[0]) : 1;
      const newTotalPrice = (offeredPrice || offer.offeredPrice) * quantityNumber;

      offer.offeredPrice = offeredPrice || offer.offeredPrice;
      offer.totalPrice = newTotalPrice;
      offer.eta = eta || offer.eta;
      offer.notes = notes || offer.notes;
      offer.status = 'under_negotiation';

      offer.negotiationHistory.push({
        by: 'supplier',
        action: 'counter_offer',
        offeredPrice: offer.offeredPrice,
        totalPrice: offer.totalPrice,
        message: notes || 'Counter offer from supplier',
        timestamp: new Date()
      });
    }

    await offer.save();

    res.status(200).json({ 
      success: true, 
      message: `Successfully ${action}ed counter offer`, 
      offer 
    });
  } catch (err) {
    console.error("Respond to counter error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get all offers for a group request (for group leader)  
exports.getGroupOffersForRequest = async (req, res) => {
  try {
    const { groupRequestId } = req.params;
    const userId = req.user._id;

    // Verify user is the group leader
    const groupRequest = await GroupRequest.findById(groupRequestId).populate('group');
    if (!groupRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group request not found' 
      });
    }

    if (groupRequest.group.leader.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only group leader can view offers' 
      });
    }

    const offers = await GroupOffer.find({ groupRequest: groupRequestId })
      .populate('supplier', 'name email role phone location')
      .sort({ createdAt: -1 });

    // Mark offers as viewed by leader
    await GroupOffer.updateMany(
      { groupRequest: groupRequestId, viewedByLeader: false },
      { viewedByLeader: true, viewedAt: new Date() }
    );

    res.status(200).json({ success: true, offers });
  } catch (err) {
    console.error("Get group offers error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get supplier's offers (for suppliers to see their own offers)
exports.getMyGroupOffers = async (req, res) => {
  try {
    const supplierId = req.user._id;

    const offers = await GroupOffer.find({ supplier: supplierId })
      .populate({
        path: 'groupRequest',
        populate: {
          path: 'group',
          populate: {
            path: 'leader',
            select: 'name email phone'
          }
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, offers });
  } catch (err) {
    console.error("Get my group offers error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get all active group requests (for suppliers to see and bid on)
exports.getActiveGroupRequests = async (req, res) => {
  try {
    const { item, location, minPrice, maxPrice } = req.query;
    
    let filter = {
      status: 'active',
      expiresAt: { $gt: new Date() }
    };

    if (item) filter.item = new RegExp(item, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (minPrice) filter.desiredPrice = { ...filter.desiredPrice, $gte: parseInt(minPrice) };
    if (maxPrice) filter.desiredPrice = { ...filter.desiredPrice, $lte: parseInt(maxPrice) };

    const groupRequests = await GroupRequest.find(filter)
      .populate({
        path: 'group',
        populate: {
          path: 'leader',
          select: 'name email phone'
        }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, groupRequests });
  } catch (err) {
    console.error("Get active group requests error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

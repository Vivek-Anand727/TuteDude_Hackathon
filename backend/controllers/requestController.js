// controllers/requestController.js (Individual vendor requests)
const Request = require('../models/Request');
const Offer = require('../models/Offer');

// Create individual request (by vendor)
exports.createRequest = async (req, res) => {
  try {
    const { item, quantity, desiredPrice, location } = req.body;

    if (!item || !quantity || !desiredPrice || !location) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required: item, quantity, desiredPrice, location' 
      });
    }

    // Validate user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ 
        success: false,
        error: 'Only vendors can create requests' 
      });
    }

    const request = new Request({
      vendor: req.user._id,
      item: item.trim(),
      quantity: quantity.trim(),
      desiredPrice: parseFloat(desiredPrice),
      location: location.trim(),
      status: 'open'
    });

    await request.save();
    await request.populate('vendor', 'name email phone location');

    return res.status(201).json({ 
      success: true,
      message: 'Request created successfully', 
      request 
    });
  } catch (err) {
    console.error('Create request error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Server error while creating request', 
      details: err.message 
    });
  }
};

// Get vendor's own requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    let filter = { vendor: userId };
    if (status) {
      filter.status = status;
    }

    const requests = await Request.find(filter)
      .populate('acceptedOffer')
      .sort({ createdAt: -1 });

    // Get offer counts for each request
    const requestsWithOfferCount = await Promise.all(
      requests.map(async (request) => {
        const offerCount = await Offer.countDocuments({ request: request._id });
        return {
          ...request.toObject(),
          offerCount
        };
      })
    );

    return res.status(200).json({ 
      success: true,
      requests: requestsWithOfferCount 
    });
  } catch (err) {
    console.error('Get my requests error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Error fetching your requests', 
      details: err.message 
    });
  }
};

// Get all open requests (for suppliers to see and bid on)
exports.getAllOpenRequests = async (req, res) => {
  try {
    const { item, location, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    
    let filter = { status: 'open' };

    // Add search filters
    if (item) {
      filter.item = new RegExp(item.trim(), 'i');
    }
    if (location) {
      filter.location = new RegExp(location.trim(), 'i');
    }
    if (minPrice) {
      filter.desiredPrice = { ...filter.desiredPrice, $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      filter.desiredPrice = { ...filter.desiredPrice, $lte: parseFloat(maxPrice) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await Request.find(filter)
      .populate('vendor', 'name email phone location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRequests = await Request.countDocuments(filter);

    // Get offer counts for each request
    const requestsWithOfferCount = await Promise.all(
      requests.map(async (request) => {
        const offerCount = await Offer.countDocuments({ request: request._id });
        return {
          ...request.toObject(),
          offerCount
        };
      })
    );

    return res.status(200).json({ 
      success: true,
      requests: requestsWithOfferCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRequests / parseInt(limit)),
        totalRequests,
        hasNext: skip + requests.length < totalRequests,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Get all open requests error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Error fetching open requests', 
      details: err.message 
    });
  }
};

// Get specific request details
exports.getRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId)
      .populate('vendor', 'name email phone location')
      .populate('acceptedOffer');

    if (!request) {
      return res.status(404).json({ 
        success: false,
        error: 'Request not found' 
      });
    }

    // Get offer count
    const offerCount = await Offer.countDocuments({ request: requestId });

    return res.status(200).json({ 
      success: true,
      request: {
        ...request.toObject(),
        offerCount
      }
    });
  } catch (err) {
    console.error('Get request by ID error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Error fetching request details', 
      details: err.message 
    });
  }
};

// Update request (only by request owner)
exports.updateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { item, quantity, desiredPrice, location } = req.body;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        error: 'Request not found' 
      });
    }

    // Check if user owns the request
    if (!request.vendor.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized: You can only update your own requests' 
      });
    }

    // Can't update if request is already fulfilled
    if (request.status === 'fulfilled') {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot update fulfilled requests' 
      });
    }

    // Update fields if provided
    if (item) request.item = item.trim();
    if (quantity) request.quantity = quantity.trim();
    if (desiredPrice) request.desiredPrice = parseFloat(desiredPrice);
    if (location) request.location = location.trim();

    await request.save();
    await request.populate('vendor', 'name email phone location');

    return res.status(200).json({ 
      success: true,
      message: 'Request updated successfully', 
      request 
    });
  } catch (err) {
    console.error('Update request error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Error updating request', 
      details: err.message 
    });
  }
};

// Close request (mark as expired by owner)
exports.closeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        error: 'Request not found' 
      });
    }

    // Check if user owns the request
    if (!request.vendor.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized: You can only close your own requests' 
      });
    }

    if (request.status === 'fulfilled') {
      return res.status(400).json({ 
        success: false,
        error: 'Request is already fulfilled' 
      });
    }

    request.status = 'expired';
    await request.save();

    // Reject all pending offers for this request
    await Offer.updateMany(
      { 
        request: requestId,
        status: { $in: ['pending', 'countered'] }
      },
      { status: 'rejected' }
    );

    return res.status(200).json({ 
      success: true,
      message: 'Request closed successfully', 
      request 
    });
  } catch (err) {
    console.error('Close request error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Error closing request', 
      details: err.message 
    });
  }
};

// Delete request (only by request owner and only if no accepted offers)
exports.deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        error: 'Request not found' 
      });
    }

    // Check if user owns the request
    if (!request.vendor.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized: You can only delete your own requests' 
      });
    }

    // Can't delete if request is fulfilled
    if (request.status === 'fulfilled') {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete fulfilled requests' 
      });
    }

    // Delete all offers for this request first
    await Offer.deleteMany({ request: requestId });

    // Delete the request
    await Request.findByIdAndDelete(requestId);

    return res.status(200).json({ 
      success: true,
      message: 'Request and associated offers deleted successfully' 
    });
  } catch (err) {
    console.error('Delete request error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Error deleting request', 
      details: err.message 
    });
  }
};

// Get request statistics (for vendor dashboard)
exports.getRequestStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Request.aggregate([
      { $match: { vendor: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format
    const statsObj = {
      open: 0,
      fulfilled: 0,
      expired: 0,
      total: 0
    };

    stats.forEach(stat => {
      statsObj[stat._id] = stat.count;
      statsObj.total += stat.count;
    });

    // Get total offers received
    const totalOffers = await Offer.aggregate([
      {
        $lookup: {
          from: 'requests',
          localField: 'request',
          foreignField: '_id',
          as: 'requestInfo'
        }
      },
      {
        $match: {
          'requestInfo.vendor': userId
        }
      },
      {
        $count: 'totalOffers'
      }
    ]);

    statsObj.totalOffersReceived = totalOffers[0]?.totalOffers || 0;

    return res.status(200).json({ 
      success: true,
      stats: statsObj 
    });
  } catch (err) {
    console.error('Get request stats error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Error fetching request statistics', 
      details: err.message 
    });
  }
};
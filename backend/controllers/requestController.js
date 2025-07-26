const Request = require('../models/Request');
const Group = require('../models/Group');

// POST /api/requests/create
exports.createRequest = async (req, res) => {
  try {
    const { item, quantity, desiredPrice, location } = req.body;

    if (!item || !quantity || !desiredPrice || !location) {
      return res.status(400).json({ error: 'All fields are required: item, quantity, desiredPrice, location' });
    }

    const request = new Request({
      vendor: req.user._id, // Auth middleware must attach user object
      item,
      quantity,
      desiredPrice,
      location
    });

    await request.save();
    return res.status(201).json({ message: 'Request created successfully', request });
  } catch (err) {
    return res.status(500).json({ error: 'Server error while creating request', details: err.message });
  }
};

// GET /api/requests/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Request.find({
      vendor: userId
    }).sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching your requests', details: err.message });
  }
};

// GET /api/requests/group/:groupId
exports.getRequestsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const requests = await Request.find({ group: groupId }).sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching requests for group', details: err.message });
  }
};

// DELETE /api/requests/:requestId
exports.deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (!request.vendor.equals(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own requests' });
    }

    await Request.findByIdAndDelete(requestId);
    return res.status(200).json({ message: 'Request deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Error deleting request', details: err.message });
  }
};

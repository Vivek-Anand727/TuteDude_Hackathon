const Request = require('../models/Request');
const Group = require('../models/Group');

// POST /api/requests/create
exports.createRequest = async (req, res) => {
  try {
    const { item, quantity, maxPrice, groupId, isGroup } = req.body;

    const request = new Request({
      item,
      quantity,
      maxPrice,
      group: isGroup ? groupId : null,
      isGroup: !!isGroup,
      createdBy: req.user._id
    });

    await request.save();
    return res.status(201).json({ message: 'Request created', request });
  } catch (err) {
    return res.status(500).json({ error: 'Server error while creating request', details: err.message });
  }
};

// GET /api/requests/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Request.find({
      $or: [
        { createdBy: userId },
        { group: { $in: req.user.groups || [] } } // Assuming user object contains joined groupIds
      ]
    }).populate('group').sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching requests', details: err.message });
  }
};

// GET /api/requests/group/:groupId
exports.getRequestsByGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const groupExists = await Group.findById(groupId);
    if (!groupExists) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const requests = await Request.find({ group: groupId }).sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching group requests', details: err.message });
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

    if (!request.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to delete this request' });
    }

    await request.remove();
    return res.status(200).json({ message: 'Request deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Error deleting request', details: err.message });
  }
};

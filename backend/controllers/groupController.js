const Group = require('../models/Group');
const GroupRequest = require('../models/GroupRequest');
const User = require('../models/User');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    console.log('Create group route hit:', req.body);
    console.log('User:', req.user);

    const { name, description, item, quantity, desiredPrice, location, maxMembers } = req.body;

    // Validate required fields
    if (!name || !item || !quantity || !desiredPrice || !location) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields",
        required: ['name', 'item', 'quantity', 'desiredPrice', 'location']
      });
    }

    const userId = req.user._id;

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newGroup = new Group({
      name,
      description: description || '',
      item,
      totalQuantity: quantity,
      desiredPrice,
      location,
      leader: userId,
      members: [{
        user: userId,
        quantity: quantity,
        joinedAt: new Date()
      }],
      maxMembers: maxMembers || 20,
      expiresAt,
      status: 'forming'
    });

    await newGroup.save();
    await newGroup.populate('leader', 'name email role');
    await newGroup.populate('members.user', 'name email role');

    console.log('Group created successfully:', newGroup._id);

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: newGroup
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: error.message 
    });
  }
};

// Join a group
exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (!quantity) {
      return res.status(400).json({ 
        success: false,
        error: "Quantity is required to join group." 
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false,
        error: "Group not found." 
      });
    }

    if (group.status !== 'forming') {
      return res.status(400).json({ 
        success: false,
        error: "Group is no longer accepting members." 
      });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ 
        success: false,
        error: "Group is full." 
      });
    }

    // Check if user is already a member
    const existingMember = group.members.find(member => member.user.toString() === userId.toString());
    if (existingMember) {
      return res.status(400).json({ 
        success: false,
        error: "User already in the group." 
      });
    }

    // Add user to group
    group.members.push({
      user: userId,
      quantity: quantity,
      joinedAt: new Date()
    });

    // Calculate total quantity properly
    const calculateTotalQuantity = (members) => {
      let totalNumber = 0;
      let unit = '';

      members.forEach(member => {
        const quantityMatch = member.quantity.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
        if (quantityMatch) {
          const number = parseFloat(quantityMatch[1]);
          const memberUnit = quantityMatch[2];
          
          if (!unit) {
            unit = memberUnit;
          }
          
          if (memberUnit.toLowerCase() === unit.toLowerCase()) {
            totalNumber += number;
          }
        }
      });

      return totalNumber > 0 ? `${totalNumber}${unit}` : quantity;
    };

    group.totalQuantity = calculateTotalQuantity(group.members);

    await group.save();
    await group.populate('members.user', 'name email role');

    res.status(200).json({ 
      success: true,
      message: "Successfully joined group", 
      group 
    });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: error.message 
    });
  }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false,
        error: "Group not found." 
      });
    }

    // Can't leave if you're the leader and there are other members
    if (group.leader.toString() === userId.toString() && group.members.length > 1) {
      return res.status(400).json({ 
        success: false,
        error: "Assign a new leader before leaving the group." 
      });
    }

    // Remove user from members
    group.members = group.members.filter(member => member.user.toString() !== userId.toString());

    // If leader leaves and it's the last member, delete the group
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ 
        success: true,
        message: "Left group successfully. Group deleted as it has no members." 
      });
    }

    await group.save();
    res.status(200).json({ 
      success: true,
      message: "Left group successfully", 
      group 
    });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: error.message 
    });
  }
};

// Assign a new leader to the group
exports.assignLeader = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newLeaderId } = req.body;
    const currentUserId = req.user._id;

    if (!newLeaderId) {
      return res.status(400).json({ 
        success: false,
        error: "New leader ID is required." 
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false,
        error: "Group not found." 
      });
    }

    // Only current leader can assign new leader
    if (group.leader.toString() !== currentUserId.toString()) {
      return res.status(403).json({ 
        success: false,
        error: "Only group leader can assign new leader." 
      });
    }

    // Check if new leader is a member
    const memberExists = group.members.some(member => member.user.toString() === newLeaderId.toString());
    if (!memberExists) {
      return res.status(400).json({ 
        success: false,
        error: "User must be a member of the group to be a leader." 
      });
    }

    group.leader = newLeaderId;
    await group.save();
    await group.populate('leader', 'name email role');

    res.status(200).json({ 
      success: true,
      message: "Leader assigned successfully", 
      group 
    });
  } catch (error) {
    console.error("Assign leader error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: error.message 
    });
  }
};

// Create group request (only leader can do this)
exports.createGroupRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false,
        error: "Group not found." 
      });
    }

    // Only leader can create group request
    if (group.leader.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        error: "Only group leader can create group request." 
      });
    }

    if (group.status !== 'forming') {
      return res.status(400).json({ 
        success: false,
        error: "Group request already exists or group is closed." 
      });
    }

    // Check if group request already exists
    const existingRequest = await GroupRequest.findOne({ group: groupId });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: "Group request already exists for this group."
      });
    }

    // Set expiration for request (3 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const groupRequest = new GroupRequest({
      group: groupId,
      item: group.item,
      quantity: group.totalQuantity,
      desiredPrice: group.desiredPrice,
      location: group.location,
      expiresAt,
      status: 'active'
    });

    await groupRequest.save();
    
    // Update group status
    group.status = 'active';
    await group.save();

    res.status(201).json({
      success: true,
      message: "Group request created successfully",
      groupRequest
    });
  } catch (error) {
    console.error("Create group request error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: error.message 
    });
  }
};

// Get group request details
exports.getGroupRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const groupRequest = await GroupRequest.findOne({ group: groupId })
      .populate({
        path: 'group',
        populate: [
          { path: 'leader', select: 'name email phone' },
          { path: 'members.user', select: 'name email' }
        ]
      });

    if (!groupRequest) {
      return res.status(404).json({
        success: false,
        error: 'Group request not found'
      });
    }

    res.status(200).json({
      success: true,
      groupRequest
    });
  } catch (error) {
    console.error('Get group request error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message
    });
  }
};

// Get all groups the current user is part of
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ 
      'members.user': userId 
    })
    .populate('leader', 'name email role')
    .populate('members.user', 'name email role')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      groups
    });
  } catch (error) {
    console.error("Get my groups error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: error.message 
    });
  }
};

// Get all available groups to join
exports.getAvailableGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const { item, location } = req.query;

    let filter = { 
      status: 'forming',
      'members.user': { $ne: userId }, // Not already a member
      expiresAt: { $gt: new Date() } // Not expired
    };

    if (item) {
      filter.item = new RegExp(item, 'i');
    }
    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    const groups = await Group.find(filter)
      .populate('leader', 'name email role')
      .populate('members.user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      groups
    });
  } catch (error) {
    console.error("Get available groups error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: error.message 
    });
  }
};

// Get group details
exports.getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('leader', 'name email role phone')
      .populate('members.user', 'name email role phone');

    if (!group) {
      return res.status(404).json({ 
        success: false,
        error: "Group not found." 
      });
    }

    res.status(200).json({
      success: true,
      group
    });
  } catch (error) {
    console.error("Get group details error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: error.message 
    });
  }
};

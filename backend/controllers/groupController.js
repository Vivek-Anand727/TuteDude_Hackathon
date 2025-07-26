const Group = require('../models/Group');
const User = require('../models/User');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, item, quantityTotal, desiredPrice, location } = req.body;

    if (!name || !item || !quantityTotal || !desiredPrice || !location) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const userId = req.user._id;

    const newGroup = new Group({
      name,
      description,
      item,
      quantityTotal,
      desiredPrice,
      location,
      leader: userId,
      members: [userId]
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Add a user to a group
exports.addUserToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIdToAdd } = req.body;

    if (!userIdToAdd) {
      return res.status(400).json({ error: "User ID to add is required." });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (group.members.includes(userIdToAdd)) {
      return res.status(400).json({ error: "User already in the group." });
    }

    group.members.push(userIdToAdd);
    await group.save();

    res.status(200).json({ message: "User added successfully", group });
  } catch (error) {
    console.error("Add user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Assign a new leader to the group
exports.assignLeader = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newLeaderId } = req.body;

    if (!newLeaderId) {
      return res.status(400).json({ error: "New leader ID is required." });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (!group.members.includes(newLeaderId)) {
      return res.status(400).json({ error: "User must be a member of the group to be a leader." });
    }

    group.leader = newLeaderId;
    await group.save();

    res.status(200).json({ message: "Leader assigned successfully", group });
  } catch (error) {
    console.error("Assign leader error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all groups the current user is part of
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId }).populate("leader", "name email");

    res.status(200).json(groups);
  } catch (error) {
    console.error("Get my groups error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

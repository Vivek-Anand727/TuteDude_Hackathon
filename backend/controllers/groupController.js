const Group = require('../models/Group');
const User = require('../models/User');

// Create a new group
exports.createGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id; // From auth middleware

  if (!name) return res.status(400).json({ error: 'Group name is required' });

  try {
    const group = new Group({
      name,
      description,
      members: [userId],
      leader: userId,
    });

    await group.save();
    res.status(201).json({ message: 'Group created successfully', group });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add user to a group
exports.addUserToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userIdToAdd } = req.body; // ID of user to be added

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.members.includes(userIdToAdd)) {
      return res.status(409).json({ message: 'User already in group' });
    }

    group.members.push(userIdToAdd);
    await group.save();

    res.status(200).json({ message: 'User added to group', group });
  } catch (err) {
    console.error('Error adding user to group:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Assign a new group leader
exports.assignLeader = async (req, res) => {
  const { groupId } = req.params;
  const { newLeaderId } = req.body;
  const currentUserId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.leader.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Only current leader can assign new leader' });
    }

    if (!group.members.includes(newLeaderId)) {
      return res.status(400).json({ error: 'New leader must be a group member' });
    }

    group.leader = newLeaderId;
    await group.save();

    res.status(200).json({ message: 'Group leader updated', group });
  } catch (err) {
    console.error('Error assigning new leader:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all groups the user is part of
exports.getMyGroups = async (req, res) => {
  const userId = req.user._id;

  try {
    const groups = await Group.find({ members: userId }).populate('leader members');
    res.status(200).json({ groups });
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// routes/groups.js
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authenticate = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authenticate);

// ====== GROUP MANAGEMENT ======

// Create a new group (vendors only)
router.post('/create', checkRole('vendor'), groupController.createGroup);

// Get user's groups (groups they're a member of)
router.get('/my-groups', groupController.getMyGroups);

// Get available groups to join
router.get('/available', groupController.getAvailableGroups);

// Get specific group details
router.get('/:groupId', groupController.getGroupDetails);

// Join a group
router.post('/:groupId/join', checkRole('vendor'), groupController.joinGroup);

// Leave a group
router.post('/:groupId/leave', groupController.leaveGroup);

// Assign new leader (only current leader)
router.post('/:groupId/assign-leader', checkRole('vendor'), groupController.assignLeader);

// ====== GROUP REQUEST MANAGEMENT ======

// Create group request (only group leader)
router.post('/:groupId/create-request', checkRole('vendor'), groupController.createGroupRequest);

// Get group request details
router.get('/:groupId/request', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;
    const GroupRequest = require('../models/GroupRequest');
    
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
});

module.exports = router;
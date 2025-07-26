const express = require('express');
const router = express.Router();

// Create a new group
router.post('/create', (req, res) => {
  // controller: groupController.createGroup
});

// Add user to group
router.post('/add-user/:groupId', (req, res) => {
  // controller: groupController.addUserToGroup
});

// Assign a group leader
router.patch('/assign-leader/:groupId', (req, res) => {
  // controller: groupController.assignLeader
});

// Get all groups of a user
router.get('/my-groups', (req, res) => {
  // controller: groupController.getMyGroups
});

module.exports = router;

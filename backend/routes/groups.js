const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/auth'); // Firebase auth token verifier

// All routes are protected
router.use(authMiddleware);

// ✅ Create a new group
router.post('/create', groupController.createGroup);

// ✅ Add a user to the group
router.post('/add-user/:groupId', groupController.addUserToGroup);

// ✅ Assign a new group leader
router.patch('/assign-leader/:groupId', groupController.assignLeader);

// ✅ Get all groups the current user is part of
router.get('/my-groups', groupController.getMyGroups);

module.exports = router;

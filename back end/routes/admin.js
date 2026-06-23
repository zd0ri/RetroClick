const express = require('express');
const router = express.Router();

const { 
    getAllUsers, 
    getUserById, 
    updateUserRole, 
    deactivateUserByAdmin, 
    reactivateUser 
} = require('../controllers/admin');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

// All admin routes require authentication and admin role
router.use(isAuthenticatedUser, isAdmin);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.patch('/users/:id/deactivate', deactivateUserByAdmin);
router.patch('/users/:id/reactivate', reactivateUser);

module.exports = router;

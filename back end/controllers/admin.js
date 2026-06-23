const db = require('../models');
const User = db.User;
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'auth_token'] },
            where: { deleted_at: null }
        });

        return res.status(200).json({
            success: true,
            rows: users
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error fetching users', details: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password', 'auth_token'] }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, result: user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error fetching user', details: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['admin', 'manager', 'customer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({ role });

        return res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error updating user role', details: error.message });
    }
};

exports.deactivateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({ deleted_at: new Date(), is_active: false });

        return res.status(200).json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error deactivating user', details: error.message });
    }
};

exports.reactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({ deleted_at: null, is_active: true });

        return res.status(200).json({
            success: true,
            message: 'User reactivated successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error reactivating user', details: error.message });
    }
};

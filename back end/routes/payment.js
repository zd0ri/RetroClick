const express = require('express');
const router = express.Router();

const { 
    createPayment, 
    updatePaymentStatus, 
    getPaymentsByCustomer, 
    getPaymentsByOrder 
} = require('../controllers/payment');

const { isAuthenticatedUser, isManager } = require('../middlewares/auth');

router.post('/', isAuthenticatedUser, createPayment);
router.get('/customer/:customer_id', isAuthenticatedUser, getPaymentsByCustomer);
router.get('/order/:orderinfo_id', isAuthenticatedUser, getPaymentsByOrder);
router.patch('/:payment_id/status', isAuthenticatedUser, isManager, updatePaymentStatus);

module.exports = router;

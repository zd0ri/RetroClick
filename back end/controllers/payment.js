const db = require('../models');
const Payment = db.Payment;
const Order = db.Order;

exports.createPayment = async (req, res) => {
    try {
        const { orderinfo_id, payment_method, amount } = req.body;
        const customer_id = req.body.customer_id;

        if (!orderinfo_id || !payment_method || !amount) {
            return res.status(400).json({ error: 'Order ID, payment method, and amount are required' });
        }

        if (!['GCash', 'Card', 'COD'].includes(payment_method)) {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        // Check if order exists
        const order = await Order.findByPk(orderinfo_id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const payment = await Payment.create({
            orderinfo_id,
            customer_id,
            payment_method,
            amount,
            payment_status: 'Pending',
            transaction_reference: `TXN-${Date.now()}`
        });

        return res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            payment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error creating payment', details: error.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { payment_id } = req.params;
        const { payment_status } = req.body;

        if (!['Pending', 'Paid', 'Failed', 'Refunded'].includes(payment_status)) {
            return res.status(400).json({ error: 'Invalid payment status' });
        }

        const payment = await Payment.findByPk(payment_id);

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const updatedPayment = await payment.update({
            payment_status,
            paid_at: payment_status === 'Paid' ? new Date() : payment.paid_at
        });

        // Update order status if payment is paid
        if (payment_status === 'Paid') {
            await Order.update(
                { status: 'Processing', payment_method: payment.payment_method },
                { where: { orderinfo_id: payment.orderinfo_id } }
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            payment: updatedPayment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error updating payment', details: error.message });
    }
};

exports.getPaymentsByCustomer = async (req, res) => {
    try {
        const customer_id = req.body.customer_id;

        const payments = await Payment.findAll({
            where: { customer_id },
            include: [{ model: Order, as: 'Order' }],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            rows: payments
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error fetching payments', details: error.message });
    }
};

exports.getPaymentsByOrder = async (req, res) => {
    try {
        const { orderinfo_id } = req.params;

        const payments = await Payment.findAll({
            where: { orderinfo_id },
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            rows: payments
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error fetching payments', details: error.message });
    }
};

const db = require('../models');
const Stock = db.Stock;
const StockRestock = db.StockRestock;
const Item = db.Item;

exports.updateStock = async (req, res) => {
    try {
        const { item_id, quantity } = req.body;

        if (!item_id || quantity === undefined) {
            return res.status(400).json({ error: 'Item ID and quantity are required' });
        }

        if (quantity < 0) {
            return res.status(400).json({ error: 'Quantity cannot be negative' });
        }

        const stock = await Stock.findByPk(item_id);

        if (!stock) {
            return res.status(404).json({ error: 'Stock record not found' });
        }

        await stock.update({ quantity });

        return res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            stock
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error updating stock', details: error.message });
    }
};

exports.restockItem = async (req, res) => {
    try {
        const { item_id, quantity_added, notes } = req.body;
        const restocked_by = req.body.user?.id;

        if (!item_id || !quantity_added) {
            return res.status(400).json({ error: 'Item ID and quantity are required' });
        }

        if (quantity_added <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' });
        }

        const stock = await Stock.findByPk(item_id);

        if (!stock) {
            return res.status(404).json({ error: 'Stock record not found' });
        }

        // Update stock quantity
        await stock.update({
            quantity: stock.quantity + quantity_added
        });

        // Log restock activity
        const restock = await StockRestock.create({
            item_id,
            quantity_added,
            restock_date: new Date(),
            notes: notes || null,
            restocked_by
        });

        return res.status(200).json({
            success: true,
            message: 'Item restocked successfully',
            stock,
            restock
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error restocking item', details: error.message });
    }
};

exports.getLowStockItems = async (req, res) => {
    try {
        const items = await Stock.findAll({
            where: {
                quantity: db.sequelize.where(
                    db.sequelize.col('quantity'),
                    db.Sequelize.Op.lte,
                    db.sequelize.col('low_stock_threshold')
                )
            },
            include: [{ model: Item, as: 'Item' }]
        });

        return res.status(200).json({
            success: true,
            rows: items
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error fetching low stock items', details: error.message });
    }
};

exports.getRestockHistory = async (req, res) => {
    try {
        const restocks = await StockRestock.findAll({
            include: [
                { model: Item, as: 'Item' },
                { model: db.User, as: 'User', attributes: ['id', 'name', 'email'] }
            ],
            order: [['restock_date', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            rows: restocks
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error fetching restock history', details: error.message });
    }
};

const db = require('../models');
const Item = db.Item;

exports.searchProducts = async (req, res) => {
    try {
        const { query, brand, model, minPrice, maxPrice, condition } = req.query;

        let where = {
            is_visible: true,
            is_available: true
        };

        if (query) {
            where = {
                ...where,
                [db.Sequelize.Op.or]: [
                    { camera_brand: { [db.Sequelize.Op.like]: `%${query}%` } },
                    { camera_model: { [db.Sequelize.Op.like]: `%${query}%` } },
                    { description: { [db.Sequelize.Op.like]: `%${query}%` } }
                ]
            };
        }

        if (brand) {
            where.camera_brand = { [db.Sequelize.Op.like]: `%${brand}%` };
        }

        if (model) {
            where.camera_model = { [db.Sequelize.Op.like]: `%${model}%` };
        }

        if (condition) {
            where.condition = condition;
        }

        if (minPrice || maxPrice) {
            where.sell_price = {};
            if (minPrice) where.sell_price[db.Sequelize.Op.gte] = minPrice;
            if (maxPrice) where.sell_price[db.Sequelize.Op.lte] = maxPrice;
        }

        const items = await Item.findAll({
            where,
            include: [{ model: db.Stock }],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        return res.status(200).json({
            success: true,
            rows: items
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error searching products', details: error.message });
    }
};

exports.autocomplete = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(200).json({ suggestions: [] });
        }

        const items = await Item.findAll({
            where: {
                [db.Sequelize.Op.or]: [
                    { camera_brand: { [db.Sequelize.Op.like]: `%${query}%` } },
                    { camera_model: { [db.Sequelize.Op.like]: `%${query}%` } }
                ],
                is_visible: true
            },
            attributes: ['item_id', 'camera_brand', 'camera_model', 'description'],
            limit: 10
        });

        const suggestions = items.map(item => ({
            id: item.item_id,
            text: `${item.camera_brand} ${item.camera_model}`,
            brand: item.camera_brand,
            model: item.camera_model
        }));

        return res.status(200).json({ suggestions });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error generating autocomplete', details: error.message });
    }
};

exports.getProductsByBrand = async (req, res) => {
    try {
        const { brand } = req.query;

        if (!brand) {
            return res.status(400).json({ error: 'Brand is required' });
        }

        const items = await Item.findAll({
            where: {
                camera_brand: { [db.Sequelize.Op.like]: `%${brand}%` },
                is_visible: true,
                is_available: true
            },
            include: [{ model: db.Stock }],
            order: [['sell_price', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            rows: items
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error fetching products by brand', details: error.message });
    }
};

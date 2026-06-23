const express = require('express');
const router = express.Router();

const { 
    updateStock, 
    restockItem, 
    getLowStockItems, 
    getRestockHistory 
} = require('../controllers/inventory');

const { isAuthenticatedUser, isManager } = require('../middlewares/auth');

// All inventory routes require authentication and manager/admin role
router.use(isAuthenticatedUser, isManager);

router.patch('/stock/:item_id', updateStock);
router.post('/restock', restockItem);
router.get('/low-stock', getLowStockItems);
router.get('/restock-history', getRestockHistory);

module.exports = router;

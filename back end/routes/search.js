const express = require('express');
const router = express.Router();

const { 
    searchProducts, 
    autocomplete, 
    getProductsByBrand 
} = require('../controllers/search');

// Search routes are public - no auth required
router.get('/search', searchProducts);
router.get('/autocomplete', autocomplete);
router.get('/by-brand', getProductsByBrand);

module.exports = router;

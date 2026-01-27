const express = require('express');
const router = express.Router();
const {
    getGroceryItems,
    getGroceryItemById,
    createGroceryItem,
    updateGroceryItem,
    deleteGroceryItem
} = require('../controllers/groceryItemManagementController');

router.get('/', getGroceryItems);
router.get('/:id', getGroceryItemById);
router.post('/', createGroceryItem);
router.put('/:id', updateGroceryItem);
router.delete('/:id', deleteGroceryItem);

module.exports = router;


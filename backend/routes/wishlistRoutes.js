const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist, syncWishlist } = require('../controllers/wishlistController');

router.get('/:userId', getWishlist);
router.post('/:userId/add', addToWishlist);
router.post('/:userId/remove', removeFromWishlist);
router.post('/:userId/sync', syncWishlist);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createLink, getLinks, getLinkById, updateLink, deleteLink, toggleArchive, bulkOperation, getDashboardStats } = require('../controllers/link.controller');
const { protect } = require('../middlewares/auth.middleware');
const { createLinkLimiter } = require('../middlewares/rateLimiter');

router.get('/stats/overview', protect, getDashboardStats);
router.post('/bulk', protect, bulkOperation);
router.get('/', protect, getLinks);
router.post('/', protect, createLinkLimiter, createLink);
router.get('/:id', protect, getLinkById);
router.put('/:id', protect, updateLink);
router.delete('/:id', protect, deleteLink);
router.patch('/:id/archive', protect, toggleArchive);

module.exports = router;

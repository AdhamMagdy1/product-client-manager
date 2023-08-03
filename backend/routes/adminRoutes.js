const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// Define the routes
router.post('/login', adminController.checkAdmin);
router.post('/signup', adminController.newAdmin);
module.exports = router;

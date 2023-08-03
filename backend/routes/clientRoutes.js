const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticateAdmin } = require('../middlewares/authMiddleware');

// Apply the authenticateAdmin middleware to all client routes
router.use(authenticateAdmin);

// Define the routes
router.get('/', clientController.getAllClients);
router.get('/products/:barcode', clientController.getClientProductsByBarcode);
router.post('/', clientController.createClient);
router.post('/:name/products', clientController.addProductToClient);
router.delete(
  '/:name/products/:product_id',
  clientController.deleteProductFromClient
);
router.delete('/:name', clientController.deleteClient);

module.exports = router;

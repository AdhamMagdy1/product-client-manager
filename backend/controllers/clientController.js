const { getDb } = require('../config');
const { validationResult } = require('express-validator');
const { writeLogEntry } = require('../util/logger');
const { generateBarcode } = require('../util/generateBarcode');

exports.getAllClients = async (req, res) => {
  try {
    const db = getDb();
    const clients = await db.collection('clients').find().toArray();
    res.json({ success: true, clients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.createClient = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, products } = req.body;
    const db = getDb();

    // Check the total number of clients
    const totalClients = await db.collection('clients').countDocuments();
    const clientLimit = 3; // Set the client limit here

    if (totalClients >= clientLimit) {
      return res.json({
        success: false,
        message: 'Reached clients limit',
      });
    }

    // Check if client name already exists
    const existingClient = await db.collection('clients').findOne({ name });
    if (existingClient) {
      return res.json({
        success: false,
        message: 'Client already exists!',
      });
    }

    const client = {
      name,
      products,
    };

    const result = await db.collection('clients').insertOne(client);
    res.json({ success: true, client: result });
    // Get the current date and time
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    // Get the admin username from req.admin and pass it to writeLogEntry
    const adminUserName = req.admin.userName;
    // Pass the message, admin username, date, and time to writeLogEntry
    writeLogEntry(
      `Client created: ${name}`,
      adminUserName,
      currentDate,
      currentTime
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.addProductToClient = async (req, res) => {
  try {
    const { name } = req.params;
    const { product_name, quantity, date } = req.body;
    const db = getDb();

    // Check the maximum number of products for each client
    const client = await db.collection('clients').findOne({ name });
    if (client.products.length >= 5) {
      return res.json({
        success: false,
        message: 'Reached maximum number of products for this client',
      });
    }

    // Check if the product name already exists for this client
    const existingProduct = client.products.find(
      (product) => product.product_name === product_name
    );
    if (existingProduct) {
      return res.json({
        success: false,
        message: 'Product with the same name already exists for this client',
      });
    }

    // Generate a unique barcode for the product
    let barcode;
    let isBarcodeUnique = false;
    while (!isBarcodeUnique) {
      barcode = generateBarcode();
      const productWithSameBarcode = await db
        .collection('clients')
        .findOne({ 'products.barcode': barcode });
      if (!productWithSameBarcode) {
        isBarcodeUnique = true;
      }
    }

    const product = {
      product_name,
      quantity,
      date,
      barcode,
    };

    await db
      .collection('clients')
      .updateOne({ name }, { $push: { products: product } });

    res.json({
      success: true,
      message: 'Product added to client successfully',
    });

    // Get the current date and time
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    // Get the admin username from req.admin and pass it to writeLogEntry
    const adminUserName = req.admin.userName;
    // Pass the message, admin username, date, and time to writeLogEntry
    writeLogEntry(
      `Product created: ${product_name} to Client: ${name}`,
      adminUserName,
      currentDate,
      currentTime
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.getClientProductsByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const db = getDb();

    // Find the client with the matching product barcode
    const client = await db
      .collection('clients')
      .findOne({ 'products.barcode': barcode });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, error: 'Client or product not found' });
    }

    // Find the matching product within the client's products array
    const product = client.products.find(
      (product) => product.barcode === barcode
    );

    res.json({ success: true, clientName: client.name, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.deleteProductFromClient = async (req, res) => {
  try {
    const { name, product_id } = req.params;
    // const { product_id } = req.body;
    const db = getDb();
    await db
      .collection('clients')
      .updateOne({ name }, { $pull: { products: { barcode: product_id } } });
    res.json({
      success: true,
      message: 'Product deleted from client successfully',
    });
    // Get the current date and time
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    // Get the admin username from req.admin and pass it to writeLogEntry
    const adminUserName = req.admin.userName;
    // Pass the message, admin username, date, and time to writeLogEntry
    writeLogEntry(
      `Product deleted: ${product_id} from Client: ${name}`,
      adminUserName,
      currentDate,
      currentTime
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { name } = req.params;
    const db = getDb();
    await db.collection('clients').deleteOne({ name });
    res.json({ success: true, message: 'Client deleted successfully' });
    // Get the current date and time
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    // Get the admin username from req.admin and pass it to writeLogEntry
    const adminUserName = req.admin.userName;
    // Pass the message, admin username, date, and time to writeLogEntry
    writeLogEntry(
      `Client deleted: ${name}`,
      adminUserName,
      currentDate,
      currentTime
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

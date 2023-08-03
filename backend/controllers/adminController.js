const bcrypt = require('bcrypt');
const { getDb } = require('../config');
const { hashPassword } = require('../util/passwordUtils');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

exports.checkAdmin = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const db = getDb();
    const admin = await db.collection('Admins').findOne({ userName });

    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (isPasswordValid) {
        // Generate a JWT token
        const token = jwt.sign({ adminId: admin.userName }, secretKey, {
          expiresIn: '7d',
        });

        res.json({ success: true, token });
      } else {
        res.json({ success: false, message: 'Invalid password' });
      }
    } else {
      res.json({ success: false, message: 'Admin not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.newAdmin = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const db = getDb();
    // Check the total number of Admins
    const totalClients = await db.collection('Admins').countDocuments();
    const clientLimit = 2; // Set the client limit here

    if (totalClients >= clientLimit) {
      return res.json({
        success: false,
        message: 'Reached Admins limit',
      });
    }
    // Check if the username already exists
    const existingAdmin = await db.collection('Admins').findOne({ userName });
    if (existingAdmin) {
      return res.json({ success: false, message: 'Username already exists' });
    }

    // Hash the password before storing it
    const hashedPassword = await hashPassword(password);

    const admin = {
      userName,
      password: hashedPassword,
    };
    const result = await db.collection('Admins').insertOne(admin);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const { getDb } = require('../config');
const jwt = require('jsonwebtoken');

// Function to verify the JWT token and extract the admin ID
const verifyToken = (token) => {
  // Verify the token using the secret key used during token generation
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Return the admin ID from the decoded token
  return decoded.adminId;
};
exports.authenticateAdmin = async (req, res, next) => {
  try {
    // Get the token from the request headers or cookies
    const token = req.headers.authorization || req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the token and extract the admin ID
    const adminId = verifyToken(token);

    // Use the admin ID to check if the admin is logged in
    const db = getDb();
    const admin = await db.collection('Admins').findOne({ userName: adminId });

    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Store the admin object in the request for further use
    req.admin = admin;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

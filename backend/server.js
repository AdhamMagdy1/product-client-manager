const express = require('express');
const { connectToDatabase } = require('./config');
const app = express();
const port = process.env.PORT || 5000;

// Import the route files
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Register the routes
app.use('/admin', adminRoutes);
app.use('/client', clientRoutes);

connectToDatabase();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

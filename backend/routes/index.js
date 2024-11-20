// routes/index.js

const express = require('express');
const userRoutes = require('./userRoutes');
const administratorRoutes = require('./administratorRoutes');


const router = express.Router();

// Register all the individual route files
router.use('/users', userRoutes);
router.use('/administrators', administratorRoutes);


module.exports = router;

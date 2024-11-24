const express = require('express');
const userRoutes = require('./userRoutes');
const administratorRoutes = require('./administratorRoutes');


const router = express.Router();

router.use('/users', userRoutes);
router.use('/administrators', administratorRoutes);


module.exports = router;

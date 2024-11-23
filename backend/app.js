const express = require('express');
const cors = require('cors'); // Import cors
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const userRoutes = require('./routes/userRoutes');
const administratorRoutes = require('./routes/administratorRoutes');
const moderatorRoutes = require('./routes/moderatorRoutes');
const addressRoutes = require('./routes/addressRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const offerRoutes = require('./routes/offerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const harvestRoutes = require('./routes/harvestRoutes');

const { sequelize } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors()); // Add this line

// Middleware for JSON parsing
app.use(express.json());

app.use('/users', userRoutes);
app.use('/administrators', administratorRoutes);
app.use('/moderators', moderatorRoutes);
app.use('/addresses', addressRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/offers', offerRoutes);
app.use('/orders', orderRoutes);
app.use('/harvests', harvestRoutes);
// Add the auth routes
app.use('/auth', authRoutes);
// Add the cart routes
app.use('/cart', cartRoutes);


// Test route to confirm server is running
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Database connection and model synchronization
async function initializeApp() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Synchronize models with the database
        await sequelize.sync({alter: true});
        console.log('Models synchronized with the database.');

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); 
    }
}

initializeApp();

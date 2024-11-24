const express = require('express');
const cors = require('cors'); // Import cors
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const offerRoutes = require('./routes/offerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const harvestRoutes = require('./routes/harvestRoutes');

const { sequelize } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

app.use(express.json());

app.use('/users', userRoutes);
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
app.use('/reviews', reviewRoutes);

// Test route to confirm server is running
app.get('/', (req, res) => {
    res.send('Server is up');
});


// Database initialization function
async function initializeDatabase(force = false) {
    try {
        // Authenticate database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Synchronize models
        await sequelize.sync({ force }); // Drop and recreate tables if force is true
        if (force) {
            console.log('Database has been initialized with an empty schema (tables dropped and recreated).');
        } else {
            console.log('Models synchronized with the database.');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

// App initialization function
async function initializeApp() {
    // Check if --init-db flag is present
    const forceInit = process.argv.includes('--init-db');
    if (forceInit) {
        console.log('Initializing database with an empty schema...');
        await initializeDatabase(true); // Force initialize the database
    } else {
        console.log('Starting application without reinitializing the database...');
        await initializeDatabase(false); // Sync models without dropping tables
    }

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

initializeApp();

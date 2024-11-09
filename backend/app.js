const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const userRoutes = require('./routes/userRoutes');
const registeredUserRoutes = require('./routes/registeredUserRoutes');
const administratorRoutes = require('./routes/administratorRoutes');
const moderatorRoutes = require('./routes/moderatorRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const customerRoutes = require('./routes/customerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const offerRoutes = require('./routes/offerRoutes');

const { sequelize,
    User,
    Administrator,
    Moderator,
    RegisteredUser,
    Category,
    Product,
    Farmer,
    Customer,
    Offer,
    SelfHarvestEvent,
    Order,
    Review } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON parsing
app.use(express.json());

app.use('/users', userRoutes);
app.use('/registered-users', registeredUserRoutes);
app.use('/administrators', administratorRoutes);
app.use('/moderators', moderatorRoutes);
app.use('/farmers', farmerRoutes);
app.use('/customers', customerRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/offers', offerRoutes);

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
        await sequelize.sync({force: true });
        console.log('Models synchronized with the database.');

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // Exit the app if database connection fails
    }
}

// Run the main function to initialize app and start server
initializeApp();

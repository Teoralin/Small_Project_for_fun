const express = require('express');
const dotenv = require('dotenv');
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
        await sequelize.sync({ force: true });
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

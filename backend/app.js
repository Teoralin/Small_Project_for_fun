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

const { sequelize, User, Address} = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use('/users', userRoutes);
app.use('/addresses', addressRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/offers', offerRoutes);
app.use('/orders', orderRoutes);
app.use('/harvests', harvestRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.send('Server is up');
});

async function initializeDatabase(force = false, seed = false) {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        await sequelize.sync({ force: false });
        if (force) {
            console.log('Database has been initialized with an empty schema (tables dropped and recreated).');
        } else {
            console.log('Models synchronized with the database.');
        }

        if (seed) {
            console.log('Seeding database with default users...');
            await seedUsers();
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

const seedUsers = async () => {
    try {
        const users = [
            {
                name: 'Admin',
                surname: 'Admin',
                email: 'admin@gmail.com',
                password: await bcrypt.hash('Admin', 10),
                contact_info: '123456789',
                role: 'Administrator',
                is_farmer: true,
            },
            {
                name: 'Moderator',
                surname: 'Moderator',
                email: 'moderator@gmail.com',
                password: await bcrypt.hash('Moderator', 10),
                contact_info: '987654321',
                role: 'Moderator',
                is_farmer: false,
            },
            {
                name: 'Customer',
                surname: 'Customer',
                email: 'customer@gmail.com',
                password: await bcrypt.hash('Customer', 10),
                contact_info: '555555555',
                role: 'Registered User',
                is_farmer: false,
            },
            {
                name: 'Farmer',
                surname: 'Farmer',
                email: 'farmer@gmail.com',
                password: await bcrypt.hash('Farmer', 10),
                contact_info: '444444444',
                role: 'Registered User',
                is_farmer: true,
            },
        ];

        const createdUsers = await User.bulkCreate(users);

        const addresses = [
            {
                user_id: createdUsers[0].user_id,
                city: 'Brno',
                street: 'Kolejní',
                house_number: 2,
                post_code: 61200,
            },
            {
                user_id: createdUsers[3].user_id,
                city: 'Prague',
                street: 'Křižíkova',
                house_number: 45,
                post_code: 18600,
            },

        ];

        await Address.bulkCreate(addresses);

        console.log('Users and addresses seeded successfully.');
    } catch (error) {
        console.error('Error seeding Users and Addresses tables:', error);
    }
};

async function initializeApp() {
    const forceInit = process.argv.includes('--init-db');
    const seedData = process.argv.includes('--fill');

    if (forceInit) {
        console.log(
            `Initializing database with an empty schema ${seedData ? ' and seed data' : ''}...`
        );
        await initializeDatabase(forceInit, seedData);
    } else {
        console.log('Starting application without reinitializing the database...');
        await initializeDatabase(false);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

initializeApp();

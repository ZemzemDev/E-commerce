const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');

// Import models to register them with Sequelize
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const SystemSetting = require('./models/SystemSetting');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection & Sync
sequelize.authenticate()
    .then(() => {
        console.log('✅ Connected to PostgreSQL Database');
        // Sync models (creates tables if they don't exist)
        return sequelize.sync({ alter: true }); // Use alter: true in dev to update columns
    })
    .then(() => {
        console.log('✅ Database models synchronized');
    })
    .catch((err) => {
        console.error('❌ Database Connection/Sync Error:', err.message);
        console.log('⚠️ Running in Demo/Failover Mode.');
    });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// Payment Config Routes
app.get('/api/config/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb'); // 'sb' is the sandbox default
});

// Basic Route
app.get('/', (req, res) => {
    res.send('E-commerce API with PostgreSQL is running...');
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

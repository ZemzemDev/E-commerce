const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const User = require('./models/User');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'testuser@example.com';
        const userExists = await User.findOne({ email });

        if (userExists) {
            await User.deleteOne({ email });
            console.log('Removed existing test user');
        }

        const user = await User.create({
            name: 'Test User',
            email: email,
            password: 'password123'
        });

        console.log('✅ Test user created successfully:');
        console.log('Email: testuser@example.com');
        console.log('Password: password123');

        process.exit();
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        process.exit(1);
    }
};

createTestUser();

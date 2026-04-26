const dotenv = require('dotenv');
const sequelize = require('./config/db');
const User = require('./models/User');

dotenv.config();

const createTestUser = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        const email = 'testuser@example.com';
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            await userExists.destroy();
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
        console.error('❌ Error creating test user:', error.message);
        process.exit(1);
    }
};

createTestUser();

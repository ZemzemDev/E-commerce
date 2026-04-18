const dotenv = require('dotenv');
const sequelize = require('./config/db');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const email = 'admin@example.com';
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            await userExists.destroy();
            console.log('Removed existing admin user');
        }

        const user = await User.create({
            name: 'Elite Admin',
            email: email,
            password: 'adminpassword123',
            isAdmin: true
        });

        console.log('✅ Admin user created successfully in MySQL:');
        console.log('Email: admin@example.com');
        console.log('Password: adminpassword123');

        process.exit();
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();

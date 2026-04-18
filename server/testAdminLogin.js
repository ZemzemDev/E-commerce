const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const dns = require('dns');
const User = require('./models/User');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'admin@example.com';
        const password = 'adminpassword123';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User found: ${user.email}`);
            const isMatch = await user.comparePassword(password);
            console.log(`Password match with adminpassword123: ${isMatch}`);

            // Try another common password just in case
            const isMatch2 = await user.comparePassword('admin123');
            console.log(`Password match with admin123: ${isMatch2}`);
        } else {
            console.log('User not found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testLogin();

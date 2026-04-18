const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const User = require('./models/User');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const verifyAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'admin@example.com' });
        if (user) {
            console.log(`User: ${user.email}`);
            console.log(`isAdmin: ${user.isAdmin}`);
        } else {
            console.log('Admin user not found!');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyAdmin();

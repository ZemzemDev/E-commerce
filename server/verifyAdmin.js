const dotenv = require('dotenv');
const sequelize = require('./config/db');
const User = require('./models/User');

dotenv.config();

const verifyAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');
        
        const user = await User.findOne({ where: { email: 'admin@example.com' } });
        
        if (user) {
            console.log('-------------------------');
            console.log(`User Name: ${user.name}`);
            console.log(`User Email: ${user.email}`);
            console.log(`Is Admin: ${user.isAdmin}`);
            console.log('-------------------------');
        } else {
            console.log('❌ Admin user not found in Supabase!');
        }
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

verifyAdmin();

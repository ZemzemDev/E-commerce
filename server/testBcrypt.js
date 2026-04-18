const bcrypt = require('bcryptjs');

const test = async () => {
    try {
        console.log('Testing bcryptjs...');
        const salt = await bcrypt.genSalt(10);
        console.log('Salt:', salt);
        const hash = await bcrypt.hash('password123', salt);
        console.log('Hash:', hash);
        const match = await bcrypt.compare('password123', hash);
        console.log('Match:', match);
    } catch (error) {
        console.error('Error:', error);
    }
};

test();

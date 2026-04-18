require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const VALID_CATEGORIES = ['Laptops', 'Phones', 'Watches', 'Earbuds', 'Tablets', 'Headphones', 'Cameras'];

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const invalidProducts = await Product.find({ category: { $nin: VALID_CATEGORIES } });
        console.log(`Found ${invalidProducts.length} invalid products:`);
        for (const p of invalidProducts) {
            console.log(`- ${p.name}: ${p.category}`);
            // Logic to fix them:
            if (p.name.includes('Canon') || p.name.includes('DJI')) {
                p.category = 'Cameras';
            } else if (p.name.includes('Samsung Odyssey')) {
                p.category = 'Laptops'; // Or Monitors, but we don't have that. Laptops is closest for display.
            } else if (p.name.includes('Nintendo')) {
                p.category = 'Tablets'; // Switch is like a tablet.
            } else {
                p.category = 'Earbuds'; // Default
            }
            await p.save();
            console.log(`  Fixed to: ${p.category}`);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

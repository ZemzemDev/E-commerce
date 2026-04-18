const dotenv = require('dotenv');
const Product = require('./models/Product');
const sequelize = require('./config/db');

dotenv.config();

const products = [
    {
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        description: 'The ultimate iPhone with Titanium design, A17 Pro chip, and advanced camera system.',
        specifications: ['6.7" Super Retina XDR', 'A17 Pro chip', '48MP Main Camera', 'USB-C supporting USB 3'],
        price: 1199.99,
        category: 'Phones',
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=1000',
        countInStock: 15,
    },
    {
        name: 'MacBook Pro M3 14"',
        brand: 'Apple',
        description: 'Advanced performance with the M3 chip and Liquid Retina XDR display.',
        specifications: ['M3 Chip', '14.2" Liquid Retina XDR', '16GB Unified Memory', '512GB SSD'],
        price: 1599.99,
        category: 'Laptops',
        image: 'https://images.unsplash.com/photo-1517336714468-1563f46f338d?auto=format&fit=crop&q=80&w=1000',
        countInStock: 8,
    },
    {
        name: 'Sony WH-1000XM5',
        brand: 'Sony',
        description: 'Industry-leading noise cancellation and premium sound quality.',
        specifications: ['30-hour battery life', 'Industry-leading ANC', 'Multipoint connection', 'Touch control'],
        price: 399.99,
        category: 'Earbuds',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
        countInStock: 25,
    },
    {
        name: 'Apple Watch Ultra 2',
        brand: 'Apple',
        description: 'The most rugged and capable Apple Watch for explorers.',
        specifications: ['Titanium case', 'Up to 36 hours battery', 'Dual-frequency GPS', 'Depth gauge'],
        price: 799.99,
        category: 'Watches',
        image: 'https://images.unsplash.com/photo-1434493907317-a46b53b81846?auto=format&fit=crop&q=80&w=1000',
        countInStock: 12,
    },
    {
        name: 'iPad Pro 12.9" M2',
        brand: 'Apple',
        description: 'Supercharged by M2 with an immersive Liquid Retina display.',
        specifications: ['12.9" Liquid Retina XDR', 'M2 Chip', 'Apple Pencil Hover', 'TrueDepth Camera'],
        price: 1099.99,
        category: 'Tablets',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1000',
        countInStock: 10,
    },
    {
        name: 'ASUS ROG Zephyrus G14',
        brand: 'ASUS',
        description: 'Powerful gaming laptop with Nebula HDR Display and 40-series GPU.',
        specifications: ['RTX 4060', 'Ryzen 9 7940HS', '16GB DDR5', '14" QHD 165Hz'],
        price: 1899.99,
        category: 'Laptops',
        image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=1000',
        countInStock: 5,
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        description: 'Unleash new levels of creativity and productivity with Galaxy AI.',
        specifications: ['6.8" QHD+', 'Snapdragon 8 Gen 3', '200MP Camera', 'Built-in S Pen'],
        price: 1299.99,
        category: 'Phones',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1000',
        countInStock: 20,
    },
    {
        name: 'Dell XPS 15',
        brand: 'Dell',
        description: 'The perfect balance of power and portability for creators.',
        specifications: ['15.6" OLED Touch', 'Intel i9-13900H', '32GB RAM', 'RTX 4070'],
        price: 2199.99,
        category: 'Laptops',
        image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&q=80&w=1000',
        countInStock: 7,
    },
    {
        name: 'Canon EOS R5',
        brand: 'Canon',
        description: 'Professional full-frame mirrorless camera for high-quality stills and 8K video.',
        specifications: ['45MP Full-Frame', '8K Video', '20fps Shooting', 'In-body Stabilization'],
        price: 3399.99,
        category: 'Gadgets',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000',
        countInStock: 4,
    },
    {
        name: 'DJI Mavic 3 Pro',
        brand: 'DJI',
        description: 'Flagship tri-camera system for unparalleled aerial photography.',
        specifications: ['Hasselblad Camera', '43-min Flight Time', '15km Transmission', 'Omnidirectional Sensing'],
        price: 2199.99,
        category: 'Gadgets',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=1000',
        countInStock: 6,
    },
    {
        name: 'Samsung Odyssey Neo G9',
        brand: 'Samsung',
        description: 'Ultra-wide 49" curved gaming monitor for ultimate immersion.',
        specifications: ['49" Curved OLED', '240Hz Refresh Rate', '0.03ms Response', 'G-Sync Compatible'],
        price: 1799.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1547115941-077ca6b8764b?auto=format&fit=crop&q=80&w=1000',
        countInStock: 3,
    },
    {
        name: 'Bose QuietComfort Ultra',
        brand: 'Bose',
        description: 'World-class noise cancellation and spatialized audio.',
        specifications: ['CustomTune technology', 'Immersive Audio', '24-hour battery', 'Quiet & Aware modes'],
        price: 429.99,
        category: 'Earbuds',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426ff472b?auto=format&fit=crop&q=80&w=1000',
        countInStock: 18,
    },
    {
        name: 'Nintendo Switch OLED',
        brand: 'Nintendo',
        description: 'Upgrade your gaming setup with the vibrant OLED screen.',
        specifications: ['7-inch OLED screen', '64GB Internal storage', 'Enhanced audio', 'TV mode'],
        price: 349.99,
        category: 'Gadgets',
        image: 'https://images.unsplash.com/photo-1578303372704-14f253a69956?auto=format&fit=crop&q=80&w=1000',
        countInStock: 30,
    },
    {
        name: 'Google Pixel 8 Pro',
        brand: 'Google',
        description: 'The all-pro phone engineered by Google with the most advanced AI.',
        specifications: ['6.7" LTPO OLED', 'Tensor G3 chip', 'Pro Camera system', '7 years of updates'],
        price: 999.99,
        category: 'Phones',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=1000',
        countInStock: 14,
    }
];

const seedData = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); // Reset DB for seeding
        await Product.bulkCreate(products);
        console.log('✅ Data Seeded Successfully to MySQL');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedData();

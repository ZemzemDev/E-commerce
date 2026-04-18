require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const Product = require('./models/Product');

const newProducts = [
    {
        name: 'AirPods Pro 3',
        brand: 'Apple',
        category: 'Earbuds',
        description: 'H2 chip, 2x better ANC, IP57 dust/water resistance, Live Translation, heart rate monitoring, 8hr battery (ANC on)',
        price: 219,
        countInStock: 25,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=1000',
        specifications: ['H2 Chip', 'Active Noise Cancellation', 'IP57 Waterproof', '8hr Battery']
    },
    {
        name: 'AirPods 4 (with ANC)',
        brand: 'Apple',
        category: 'Earbuds',
        description: 'H2 chip, active noise cancellation, Spatial Audio, USB-C charging, comfortable semi-open fit',
        price: 179,
        countInStock: 30,
        image: 'https://images.unsplash.com/photo-1588156979435-379b9d365296?auto=format&fit=crop&q=80&w=1000',
        specifications: ['H2 Chip', 'Active Noise Cancellation', 'Spatial Audio', 'USB-C']
    },
    {
        name: 'AirPods Max 2',
        brand: 'Apple',
        category: 'Headphones',
        description: 'H2 chip, 1.5x better ANC, 24-bit/48kHz lossless via USB-C, Adaptive Audio, Live Translation',
        price: 549,
        countInStock: 15,
        image: 'https://images.unsplash.com/photo-1628773193539-ad29c647c071?auto=format&fit=crop&q=80&w=1000',
        specifications: ['H2 Chip', 'Lossless Audio', 'Adaptive Audio', '20hr Battery']
    },
    {
        name: 'Bose Ultra Open Earbuds',
        brand: 'Bose',
        category: 'Earbuds',
        description: 'Clip-on design, OpenAudio technology, spatial sound, secure fit for exercise, works with glasses',
        price: 299,
        countInStock: 20,
        image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Clip-on Design', 'OpenAudio', 'Spatial Sound', 'Secure Fit']
    },
    {
        name: 'Nothing Ear (Open)',
        brand: 'Nothing',
        category: 'Earbuds',
        description: 'Titanium ear hooks, Bluetooth 5.3 multipoint, AI dual-mic noise reduction, 30hr total battery',
        price: 150,
        countInStock: 40,
        image: 'https://images.unsplash.com/photo-1674008748891-a49c4362116b?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Titanium Hooks', 'Bluetooth 5.3', 'AI Noise Reduction', '30hr Total Battery']
    },
    {
        name: 'Shokz OpenRun Pro 2',
        brand: 'Shokz',
        category: 'Earbuds',
        description: 'Bone conduction + air conduction drivers, IP55 waterproof, 12hr battery, secure wraparound design',
        price: 179,
        countInStock: 50,
        image: 'https://images.unsplash.com/photo-1591522810850-58128c5fb089?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Bone Conduction', 'IP55 Waterproof', '12hr Battery', 'Wraparound Design']
    },
    {
        name: 'EarFun Air Pro 4',
        brand: 'EarFun',
        category: 'Earbuds',
        description: 'Adaptive ANC, in-ear detection, Bluetooth 5.4, 11hr battery (52hr with case), wireless charging',
        price: 53,
        countInStock: 100,
        image: 'https://images.unsplash.com/photo-1598382143506-2ac06c28d203?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Adaptive ANC', 'Bluetooth 5.4', '11hr Battery', 'Wireless Charging']
    },
    {
        name: 'EarFun Air Pro 4+',
        brand: 'EarFun',
        category: 'Earbuds',
        description: 'Bluetooth 6.0, real-time AI translation, upgraded features',
        price: 80,
        countInStock: 60,
        image: 'https://images.unsplash.com/photo-1585333121517-a04433072d96?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Bluetooth 6.0', 'AI Translation', 'Premium Finish']
    },
    {
        name: 'TOZO A1 Mini',
        brand: 'TOZO',
        category: 'Earbuds',
        description: 'Ultra-budget, 6mm drivers, Bluetooth 5.3, 7hr battery (32hr with case), lightweight design',
        price: 13,
        countInStock: 200,
        image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&q=80&w=1000',
        specifications: ['6mm Drivers', 'Bluetooth 5.3', 'Ultra-Lightweight']
    },
    {
        name: 'Soundcore Q20i',
        brand: 'Soundcore',
        category: 'Headphones',
        description: 'Active noise cancellation, 40hr battery (ANC on), BassUp technology, memory foam earpads',
        price: 45,
        countInStock: 80,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Active Noise Cancellation', '40hr Battery', 'BassUp Technology']
    },
    {
        name: 'Soundcore Sleep A30 Special',
        brand: 'Soundcore',
        category: 'Earbuds',
        description: 'Ultra-comfortable side-sleeping design, ANC, snore masking technology, Calm app partnership',
        price: 199,
        countInStock: 35,
        image: 'https://images.unsplash.com/photo-1583394838336-acd977730f5a?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Side-sleeper Design', 'Snore Masking', 'Sleep Monitoring']
    },
    {
        name: 'HUAWEI FreeClip',
        brand: 'HUAWEI',
        category: 'Earbuds',
        description: 'C-bridge clip design, 5.6g per earbud, AI noise cancellation, dual-device Bluetooth',
        price: 260,
        countInStock: 15,
        image: 'https://images.unsplash.com/photo-1511306760489-3e7c617aef98?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Clip Design', '5.6g Ultra-Light', 'Dual-device connection']
    },
    {
        name: 'EarFun Clip',
        brand: 'EarFun',
        category: 'Earbuds',
        description: 'Bluetooth 6.0, LDAC Hi-Res Audio support, adaptive clip mechanism, 40hr total battery',
        price: 75,
        countInStock: 55,
        image: 'https://images.unsplash.com/photo-1572536147743-bc970ec99088?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Bluetooth 6.0', 'LDAC Hi-Res', '40hr Battery']
    },
    {
        name: 'Mivi SuperPods Immersio',
        brand: 'Mivi',
        category: 'Earbuds',
        description: 'Dolby Audio, 3D Soundstage, 60hr total battery, AI-ENC quad mic, fast charging, metallic glass finish',
        price: 25,
        countInStock: 150,
        image: 'https://images.unsplash.com/photo-1508759073847-9ca702cec7ad?auto=format&fit=crop&q=80&w=1000',
        specifications: ['Dolby Audio', '60hr Battery', 'AI-ENC Quad Mic']
    },
    {
        name: 'AI+ NovaPods Go',
        brand: 'AI+',
        category: 'Earbuds',
        description: '10mm drivers, Bluetooth 5.4, IPX4 water resistant, 6.5hr battery (24hr with case)',
        price: 10,
        countInStock: 300,
        image: 'https://images.unsplash.com/photo-1623347642000-dc7519736423?auto=format&fit=crop&q=80&w=1000',
        specifications: ['10mm Drivers', 'Bluetooth 5.4', 'IPX4 Water Resistant']
    }
];

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 })
    .then(async () => {
        console.log('Connected to DB for import...');
        for (const p of newProducts) {
            // Check if product with same name already exists to avoid duplicates
            const exists = await Product.findOne({ name: p.name });
            if (exists) {
                console.log(`Skipping existing product: ${p.name}`);
                continue;
            }
            await Product.create(p);
            console.log(`Imported: ${p.name}`);
        }
        console.log('All products imported successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Import Error:', err);
        process.exit(1);
    });

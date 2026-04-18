require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS for SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Product = require('../models/Product');

const productsData = {
    "iPhone 15 Pro Max": {
        brand: "Apple",
        description: "Aerospace-grade titanium design, A17 Pro chip, customizable Action button, and a more versatile Pro camera system.",
        price: 1199,
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Titanium Design", "A17 Pro Chip", "48MP Main Camera", "USB-C Support"]
    },
    "MacBook Pro M3 14\"": {
        brand: "Apple",
        description: "The most advanced chips ever built for a personal computer. Liquid Retina XDR display is the best ever in a laptop.",
        price: 1599,
        image: "https://images.unsplash.com/photo-1517336714467-d13a250367ce?auto=format&fit=crop&q=80&w=1000",
        specifications: ["M3 Chip", "Liquid Retina XDR", "20hr Battery Life", "MagSafe 3"]
    },
    "Samsung Galaxy S24 Ultra": {
        brand: "Samsung",
        description: "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display.",
        price: 1299,
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Titanium Frame", "S Pen Included", "200MP Camera", "AI Features"]
    },
    "Sony WH-1000XM5": {
        brand: "Sony",
        description: "Industry-leading noise cancellation. Crystal-clear hands-free calling. All-day battery life with quick charging.",
        price: 399,
        image: "https://images.unsplash.com/photo-1546435770-a3e426ff472b?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Active Noise Canceling", "30hr Battery Life", "LDAC Support", "Multipoint Connection"]
    },
    "Canon EOS R5": {
        brand: "Canon",
        description: "The EOS R5 features a newly developed 45MP CMOS sensor, 8K video recording, and advanced subject tracking.",
        price: 3899,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
        specifications: ["45MP Full-Frame", "8K Raw Video", "20 fps Shooting", "IBIS Support"]
    },
    "DJI Mavic 3 Pro": {
        brand: "DJI",
        description: "A triple-camera system drone that ushers in a new era of camera drones by housing three sensors and lenses with different focal lengths.",
        price: 2199,
        image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Hasselblad Camera", "43-min Flight Time", "Omnidirectional Sensing", "15km HD Video"]
    },
    "AirPods Max 2": {
        brand: "Apple",
        description: "A perfect balance of exhilarating high-fidelity audio and the effortless magic of AirPods. Now with USB-C and enhanced ANC.",
        price: 549,
        image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Active Noise Canceling", "Spatial Audio", "20hr Battery", "Digital Crown Control"]
    },
    "AirPods Pro 3": {
        brand: "Apple",
        description: "The most advanced AirPods yet, featuring double the active noise cancellation and personalized spatial audio.",
        price: 249,
        image: "https://images.unsplash.com/photo-1588423770519-61ba958744b7?auto=format&fit=crop&q=80&w=1000",
        specifications: ["H2 Chip", "Personalized ANC", "MagSafe Case", "IPX4 Water Resistant"]
    },
    "Galaxy Buds 4 Pro": {
        brand: "Samsung",
        description: "Ultimate Hi-Fi sound in your ear. Enhanced ANC and intelligent 360 audio for an immersive listening experience.",
        price: 199,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=1000",
        specifications: ["24-bit Hi-Fi Sound", "Intelligent ANC", "Auto Switch", "Bixby Voice Wake-up"]
    },
    "Bose QuietComfort Ultra": {
        brand: "Bose",
        description: "Take spatial audio to the next level with Bose Immersive Audio. World-class noise cancellation that’s quieter than ever.",
        price: 429,
        image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Bose Immersive Audio", "CustomTune Technology", "Ultra-soft Cushions", "24hr Battery"]
    },
    "Dell XPS 15": {
        brand: "Dell",
        description: "The most powerful XPS laptop yet. Featuring 13th Gen Intel Core processors and NVIDIA GeForce RTX graphics.",
        price: 1899,
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=1000",
        specifications: ["InfinityEdge Display", "NVIDIA RTX 40-series", "CNC Machined Aluminum", "100% Adobe RGB"]
    },
    "iPad Pro 12.9\" M2": {
        brand: "Apple",
        description: "Astonishing performance. Incredibly advanced displays. Superfast wireless connectivity. Powerful new features in iPadOS.",
        price: 1099,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1000",
        specifications: ["M2 Chip", "Liquid Retina XDR", "ProRes Video", "Thunderbolt Port"]
    },
    "Apple Watch Ultra 2": {
        brand: "Apple",
        description: "The most rugged and capable Apple Watch ever. Featuring a stunning titanium case and the brightest display ever.",
        price: 799,
        image: "https://images.unsplash.com/photo-1544117518-2b622788bb57?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Titanium Case", "3000 nits Brightness", "Action Button", "Up to 36hr Battery"]
    },
    "Nintendo Switch OLED": {
        brand: "Nintendo",
        description: "Experience vibrant colors and sharp contrast with the 7-inch OLED screen. Features a wide adjustable stand and internal storage.",
        price: 349,
        image: "https://images.unsplash.com/photo-1578303372293-f7735e3ca917?auto=format&fit=crop&q=80&w=1000",
        specifications: ["7-inch OLED Screen", "Enhanced Audio", "64GB Internal Storage", "LAN Port in Dock"]
    },
    "Samsung Odyssey Neo G9": {
        brand: "Samsung",
        description: "Unrivaled immersion. Revolutionary Quantum Matrix Technology with Quantum Mini LEDs creates controlled brightness.",
        price: 1599,
        image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=1000",
        specifications: ["49-inch Curved Panel", "240Hz Refresh Rate", "Quantum HDR 2000", "G-Sync Compatible"]
    },
    "ASUS ROG Zephyrus G14": {
        brand: "ASUS",
        description: "The most powerful 14-inch gaming laptop. Featuring NVIDIA GeForce RTX graphics and an AMD Ryzen processor.",
        price: 1449,
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1000",
        specifications: ["AniMe Matrix Display", "ROG Nebula Display", "DDR5 Memory", "90Wh Battery"]
    },
    "Google Pixel 8 Pro": {
        brand: "Google",
        description: "The all-pro phone by Google. It's fast, secure, and has a professional camera system for amazing photos and videos.",
        price: 999,
        image: "https://images.unsplash.com/photo-1610945415295-d9baf06025a1?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Google Tensor G3", "Pro Triple Camera", "Actua Display", "7 Years Updates"]
    },
    "OpenRun Pro 2": {
        brand: "Shokz",
        description: "Open-ear bone conduction headphones with high-quality bass and dual-pitch technology for extreme sports.",
        price: 179,
        image: "https://images.unsplash.com/photo-1591522810850-58128c5fb089?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Bone Conduction", "DualPitch Technology", "IP55 Waterproof", "12hr Battery"]
    },
    "Ear (Open)": {
        brand: "Nothing",
        description: "Nothing's first open-ear earbuds. Transparent design, incredible sound, and all-day comfort without blocking the world.",
        price: 149,
        image: "https://images.unsplash.com/photo-1674008748891-a49c4362116b?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Sound Seal System", "IP54 Rated", "30hr Battery Life", "Dual Microphones"]
    },
    "Ultra Open Earbuds": {
        brand: "Bose",
        description: "Futuristic cuff-like design earbuds that clip onto your ear. Immerse yourself in music while hearing everything else.",
        price: 299,
        image: "https://images.unsplash.com/photo-1572536147743-bc970ec99088?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Clip-on Design", "OpenAudio Tech", "Immersive Audio", "7.5hr Battery"]
    },
    "ARC 4 Series": {
        brand: "Cleer",
        description: "THX-certified open-ear true wireless earbuds with large 16.2mm drivers and high-definition Dolby Audio.",
        price: 129,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=1000",
        specifications: ["THX Certified", "Dolby Audio", "32hr Battery", "IPX7 Waterproof"]
    },
    "Aura Nebula": {
        brand: "AI+",
        description: "Premium earbuds with a stunning nebula aesthetic. Features adaptive ANC and a signature metallic glass finish.",
        price: 199,
        image: "https://images.unsplash.com/photo-1508759073847-9ca702cec7ad?auto=format&fit=crop&q=80&w=1000",
        specifications: ["Adaptive ANC", "Metallic Finish", "Hi-Res Audio", "Wireless Charging"]
    }
};

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to DB...');
        const productsInDb = await Product.find({});
        console.log(`Found ${productsInDb.length} products in database.`);

        for (const product of productsInDb) {
            const data = productsData[product.name.trim()];
            if (data) {
                console.log(`Updating product: ${product.name}`);
                product.brand = data.brand;
                product.description = data.description;
                product.price = data.price;
                product.image = data.image;
                product.specifications = data.specifications;
                product.countInStock = 50; // Default stock for all
                await product.save();
            } else {
                console.log(`No data found for product: ${product.name}`);
            }
        }

        console.log('All products updated successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error connecting to DB:', err);
        process.exit(1);
    });

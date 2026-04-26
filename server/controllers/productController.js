const Product = require('../models/Product');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Op } = require('sequelize');
const sequelize = require('../config/db');



// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
    const where = {};
    if (req.query.keyword) {
        where.name = { [Op.like]: `%${req.query.keyword}%` };
    }
    if (req.query.category) {
        where.category = req.query.category;
    }

    try {
        const products = await Product.findAll({ where });
        // Map id to _id for frontend compatibility and parse price as number
        const mappedProducts = products.map(p => {
            const json = p.toJSON();
            json.price = parseFloat(json.price);
            return json;
        });
        res.json(mappedProducts);
    } catch (error) {
        console.error('⚠️ DB Fetch Error:', error.message);
        res.status(500).json({ message: 'Error fetching products from database. It might be waking up.' });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            const json = product.toJSON();
            json.price = parseFloat(json.price);
            res.json(json);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
    const { name, brand, category, description, specifications, price, countInStock, image } = req.body;
    try {
        const product = new Product({
            name,
            brand,
            category,
            description,
            specifications: specifications || [],
            price,
            countInStock,
            image
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    const { name, brand, category, description, specifications, price, countInStock, image } = req.body;
    try {
        const product = await Product.findByPk(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.brand = brand || product.brand;
            product.category = category || product.category;
            product.description = description || product.description;
            product.specifications = specifications || product.specifications;
            product.price = price !== undefined ? price : product.price;
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
            product.image = image || product.image;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
    }
};

const getGeminiResponse = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) return null;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
};

const fetchUnsplashIds = async (query) => {
    try {
        const { data } = await axios.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=15`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (data && data.results) {
            return data.results.map(r => r.id);
        }
        return [];
    } catch (error) {
        console.error('Unsplash live fetch error:', error.message);
        return [];
    }
};

// @desc    Detect product info using AI (Gemini) or Enhanced Internal Brain
// @route   POST /api/products/detect
exports.detectProductInfo = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Product name is required' });
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const lowerName = name.toLowerCase();

    // 1. Try Live Gemini AI if Key exists
    if (GEMINI_KEY && GEMINI_KEY !== 'your_gemini_key_here') {
        try {
            console.log('🔮 Calling Gemini AI for:', name);
            const prompt = `Act as an elite tech store curator. Analyze the product name: "${name}". 
            Return a JSON object with EXACTLY these fields: 
            "brand" (string), 
            "category" (one of: Laptops, Phones, Watches, Earbuds, Tablets, Headphones, Cameras), 
            "description" (one professional summary, max 300 chars), 
            "price" (numeric retail estimatation), 
            "specifications" (array of 4 technical strings). 
            ONLY return raw JSON. No markdown.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (aiText) {
                // Clean cleanup in case AI adds markdown blocks
                const cleanJson = aiText.replace(/```json|```/g, '').trim();
                const result = JSON.parse(cleanJson);
                
                // Stable CDN IDs
                const idMap = {
                    'Laptops': '1496181133206-80ce9b88a853',
                    'Phones': '1511707171634-5f897ff02aa9',
                    'Watches': '1523275335684-37898b6baf30',
                    'Headphones': '1505740420928-5e560c06d30e',
                    'Earbuds': '1590658268037-6bf12165a8df',
                    'Tablets': '1544244015-0df4b3ffc6b0',
                    'Cameras': '1516035069371-29a1b244cc32'
                };
                
                const photoId = idMap[result.category] || '1519389950473-47ba0277781c';
                result.image = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;
                result.images = Object.values(idMap).map(id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`);
                
                return res.json({ ...result, success: true, mode: 'Live AI' });
            }
        } catch (error) {
            console.error('⚠️ Gemini API Error, falling back to Enhanced Brain:', error.message);
        }
    }

    // 2. Enhanced Internal Brain (Mock/Fallback)
    console.log('🧠 Using Enhanced Internal Brain for:', name);
    
    // Expanded local knowledge base with comprehensive mapping
    const BRAIN_DATA = [
        { keys: ['iphone', 'pixel', 'galaxy', 's24', 'phone', 'xiaomi', 'oneplus', 'nothing'], brand: 'Premium', category: 'Phones', basePrice: 799, specs: ['Liquid Retina Display', 'AI-Powered Camera', 'Fast Charging', '5G Capable'] },
        { keys: ['macbook', 'surface', 'dell', 'xps', 'hp', 'spectre', 'lenovo', 'thinkpad', 'razer', 'laptop', 'notebook'], brand: 'Premium', category: 'Laptops', basePrice: 1199, specs: ['High-Performance CPU', 'Premium Aluminum Chassis', 'Backlit Keyboard', 'All-Day Battery'] },
        { keys: ['sony wh', 'headphones', 'bose', 'audio', 'qc45', 'sennheiser', 'marshall', 'v-moda'], brand: 'Premium', category: 'Headphones', basePrice: 349, specs: ['Industry-Leading ANC', 'Over-Ear Comfort', 'Wireless Hi-Res Audio', 'Multipoint Connection'] },
        { keys: ['airpods', 'buds', 'earbuds', 'jabra', 'beats', 'fit pro'], brand: 'Premium', category: 'Earbuds', basePrice: 199, specs: ['Compact Charging Case', 'Sweat & Water Resistant', 'Touch Controls', 'Instant Pairing'] },
        { keys: ['watch', 'casio', 'rolex', 'seiko', 'garmin', 'apple watch', 'fitbit', 'g-shock', 'timepiece'], brand: 'Premium', category: 'Watches', basePrice: 249, specs: ['Precision Movement', 'Always-On Display', 'Water Resistance', 'Health Tracking'] },
        { keys: ['ipad', 'tablet', 'tab', 'kindle', 'ereader'], brand: 'Premium', category: 'Tablets', basePrice: 499, specs: ['Ultra-Thin Profile', 'Vibrant Display', 'Stylus Support', 'Smooth Performance'] },
        { keys: ['camera', 'canon', 'nikon', 'sony a', 'fujifilm', 'lumix', 'mirrorless', 'dslr', 'gopro', 'instax'], brand: 'Premium', category: 'Cameras', basePrice: 1299, specs: ['High-Resolution Sensor', 'Interchangeable Lens Mount', '4K Video Recording', 'Fast Continuous Shooting'] }
    ];

    let match = BRAIN_DATA.find(item => item.keys.some(key => lowerName.includes(key)));
    
    // Fallback logic
    if (!match) {
        match = {
            brand: name.split(' ')[0] || 'Premium',
            category: 'All',
            basePrice: 199,
            specs: ['Elite Build Quality', 'High Performance', 'Next-Gen Technology', 'Ergonomic Design']
        };
    }

    // Dynamic brand detection if it matches any known brand keyword
    const brands = ['Apple', 'Sony', 'Samsung', 'Google', 'Dell', 'HP', 'Microsoft', 'Nikon', 'Canon', 'Casio', 'Bose', 'Lenovo'];
    const detectedBrand = brands.find(b => lowerName.includes(b.toLowerCase()));
    const finalBrand = detectedBrand || match.brand;

    // Randomized but realistic price
    const finalPrice = Math.floor(Math.random() * (match.basePrice * 1.5 - match.basePrice) + match.basePrice) + 0.99;

    // Tailor descriptions based on category
    let description = `Experience the future of personal technology with the ${name}. Engineered for peak performance and dressed in a stunning, minimalist aesthetic.`;
    if (match.category === 'Watches') {
        description = `The ${name} is a masterpiece of precision and style. A timeless addition to any collection, featuring a premium build and sophisticated craftsmanship.`;
    } else if (match.category === 'Cameras') {
        description = `Capture every moment in breathtaking detail with the ${name}. A professional-grade tool designed for creators who demand visual perfection.`;
    } else if (match.category === 'Laptops' || match.category === 'Phones') {
        description = `Redefine your productivity and digital experience with the ${name}. Combining cutting-edge hardware with a sleek, ultra-portable design.`;
    }

    // Comprehensive Asset Pool for Variety
    const ASSET_POOLS = {
        'Phones': [
            '1511707171634-5f897ff02aa9', '1598327105666-5b89351aff97', '1567581935884-3349723552ca', '1523206489230-c012c64b2b48', '1550513194-423e515865bb', '1512499617640-c74ae3a79d37'
        ],
        'Laptops': [
            '1496181133206-80ce9b88a853', '1517336714467-d13a250367ce', '1498050108023-c5249f4df085', '1525547718571-0390c850a713', '1588872657578-7efd1f1555ed', '1593642632823-8f785ba67e45'
        ],
        'Headphones': [
            '1505740420928-5e560c06d30e', '1484704849700-f032a568e944', '1546435770-a3e426bf472b', '1520170350707-b2da53041df6', '1545127398-14699f92334b', '1585232354028-45c1c4eaa697'
        ],
        'Watches': [
            '1523275335684-37898b6baf30', '1523170335270-f5cd5e13b346', '1524805444758-089113d48a6d', '1508685096489-7aac29ac7b2e', '1542491509-3001e1e1199a', '1612817159949-195b6eb9e31a'
        ],
        'Earbuds': [
            '1590658268037-6bf12165a8df', '1572569511254-183666922ba8', '1585333127302-861f17f1802e', '1613040809718-d77bd83d7b7b', '1505740420928-5e560c06d30e', '1598331668826-20cecc596b86'
        ],
        'Tablets': [
            '1544244015-0df4b3ffc6b0', '1585914924626-15adac1e6402', '1512499617640-c74ae3a79d37', '1561154464-82e9adf3b318', '1512499617640-c74ae3a79d37', '1542751110-97427bbecf20'
        ],
        'Cameras': [
            '1516035069371-29a1b244cc32', '1510127034890-adea1347641c', '1502920917128-1aa500764cbd', '1452784444945-3f422708bcea', '1500646953400-045056a813ed', '1519638399535-15c036d07a9a'
        ],
        'All': [
            '1519389950473-47ba0277781c', '1485827404703-89b55fcc595e', '1550745165-9bc0b252726f', '1526374965328-7f61d4dc18c5', '1504333631517-3d91cf1c4610'
        ]
    };

    // Deterministic selection based on name hash (for the 'first' recommendation)
    const pool = ASSET_POOLS[match.category] || ASSET_POOLS['All'];
    
    // Attempt Live Search Bridge
    let liveIds = [];
    try {
        liveIds = await fetchUnsplashIds(name);
    } catch (err) {
        console.log("Live search fallback activated.");
    }

    const finalIds = liveIds.length >= 4 ? liveIds : pool;
    const hashCode = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Result Shifting: Ensure different brands show different starting results
    const shift = finalIds.length > 8 ? hashCode % (finalIds.length - 8) : 0;
    const shiftedIds = finalIds.slice(shift, shift + 12);
    
    const photoId = shiftedIds[0] || finalIds[0];
    
    // Pick 8-12 unique images for the palette
    const images = (shiftedIds.length >= 4 ? shiftedIds : finalIds.slice(0, 12)).map(id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`);

    return res.json({
        brand: finalBrand,
        category: match.category,
        price: finalPrice,
        specs: match.specs,
        description,
        image: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`,
        images: images,
        success: true,
        mode: liveIds.length > 0 ? 'Live Unsplash Search' : 'AI-Ready (Fallback)',
        message: liveIds.length > 0 ? 'Live results found!' : 'Intelligent brain active.'
    });
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.destroy();
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete multiple products (Admin only)
// @route   POST /api/products/bulk-delete
exports.bulkDeleteProducts = async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'No product IDs provided for deletion' });
    }
    
    try {
        await Product.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });
        res.json({ message: `${ids.length} products removed successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

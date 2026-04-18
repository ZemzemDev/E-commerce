const SystemSetting = require('../models/SystemSetting');
const sequelize = require('../config/db');

// @desc    Get hero backgrounds
// @route   GET /api/settings/hero-backgrounds
exports.getHeroBackgrounds = async (req, res) => {
    // Default images
    const defaults = [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=2071',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=2000',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072'
    ];

    try {
        const setting = await SystemSetting.findOne({ where: { key: 'hero_backgrounds' } });
        if (setting) {
            res.json(setting.value);
        } else {
            res.json(defaults);
        }
    } catch (error) {
        // Fallback to defaults on DB error
        console.error('⚠️ DB Fetch Error:', error.message);
        res.json(defaults);
    }
};

// @desc    Update hero backgrounds (Admin only)
// @route   PUT /api/settings/hero-backgrounds
exports.updateHeroBackgrounds = async (req, res) => {
    const { images } = req.body;
    if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: 'Invalid image list' });
    }
    try {
        let setting = await SystemSetting.findOne({ where: { key: 'hero_backgrounds' } });
        if (setting) {
            setting.value = images;
            await setting.save();
        } else {
            setting = await SystemSetting.create({ key: 'hero_backgrounds', value: images });
        }
        res.json(setting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

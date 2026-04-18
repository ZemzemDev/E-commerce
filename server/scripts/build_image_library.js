const fs = require('fs');
const path = require('path');

const categories = ['Laptops', 'Phones', 'Watches', 'Earbuds', 'Tablets', 'Headphones', 'Cameras'];
// For Unsplash search we might use synonymous queries
const searchQueries = {
    'Laptops': 'laptop computer',
    'Phones': 'smartphone',
    'Watches': 'smartwatch',
    'Earbuds': 'wireless earbuds',
    'Tablets': 'ipad tablet',
    'Headphones': 'headphones studio',
    'Cameras': 'digital camera dslr'
};

async function build() {
    const library = {};
    for (const cat of categories) {
        console.log(`Fetching for ${cat}...`);
        const query = searchQueries[cat];
        // Fetch 30 images to ensure we can get 20 unique high quality ones
        const res = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=30`);
        const data = await res.json();
        
        const photoIds = [];
        for (const item of data.results) {
            // urls.raw usually looks like: https://images.unsplash.com/photo-1496181133206-80ce9b88a853?...
            const rawUrl = item.urls.raw;
            const match = rawUrl.match(/photo-([a-zA-Z0-9\-]+)/);
            if (match && match[1]) {
                const idStr = match[1].split('?')[0]; // Just in case
                if (!photoIds.includes(idStr)) {
                    photoIds.push(idStr);
                }
            }
            if (photoIds.length === 20) break;
        }
        library[cat] = photoIds;
    }

    // Now format this into a JS object string
    let libCode = 'const IMAGE_LIBRARY = {\n';
    for (const cat of categories) {
        libCode += `    ${cat}: [\n`;
        const ids = library[cat];
        // chunk into 5 per line
        for (let i = 0; i < ids.length; i += 5) {
            const chunk = ids.slice(i, i + 5).map(id => `'${id}'`).join(', ');
            libCode += `        ${chunk}${i + 5 < ids.length ? ',' : ''}\n`;
        }
        libCode += `    ],\n`;
    }
    libCode += '};';

    const importScriptPath = path.join(__dirname, 'import_products.js');
    let content = fs.readFileSync(importScriptPath, 'utf8');
    
    // Replace the IMAGE_LIBRARY block
    content = content.replace(/const IMAGE_LIBRARY = \{[\s\S]*?\};\n/, libCode + '\n');
    
    fs.writeFileSync(importScriptPath, content, 'utf8');
    console.log('Successfully updated import_products.js');
}

build().catch(console.error);

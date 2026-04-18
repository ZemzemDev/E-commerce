const Product = require('../models/Product');
const sequelize = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const categories = ['Laptops', 'Phones', 'Watches', 'Earbuds', 'Tablets', 'Headphones', 'Cameras'];

const IMAGE_LIBRARY = {
    Laptops: [
        '1661662850226-83c981ed4eba', '1511385348-a52b4a160dc2', '1618424181497-157f25b6ddd5', '1541807084-5c52b6b3adef', '1670071482446-b69ddbde30e6',
        '1491472253230-a044054ca35f', '1588872657578-7efd1f1555ed', '1577375729152-4c8b5fcda381', '1661414488218-abfc3b1a3bbe', '1542393545-10f5cde2c810',
        '1527800792452-506aacb2101f', '1555117391-6c0795768da8', '1671247953201-2fdc17af6692', '1453928582365-b6ad33cbcf64', '1611186871348-b1ce696e52c9',
        '1496181133206-80ce9b88a853', '1673548917361-12f3c0cf51a9', '1678013815462-e05a1290eabf', '1611078489935-0cb964de46d6', '1498049860654-af1a5c566876'
    ],
    Phones: [
        '1666298863696-8e8da5d85f2b', '1592890288564-76628a30a657', '1598327105666-5b89351aff97', '1634403665481-74948d815f03', '1680985551009-05107cd2752c',
        '1511707171634-5f897ff02aa9', '1573152143286-0c422b4d2175', '1572016047668-5b5e909e1605', '1661884002007-fea55e211ec7', '1598826867442-9ef9e2527b1e',
        '1598965402089-897ce52e8355', '1522125670776-3c7abb882bc2', '1689604958753-9765f5a6a223', '1612442058361-178007e5e498', '1423784346385-c1d4dac9893a',
        '1480694313141-fce5e697ee25', '1668472170724-8b544ca3c86e', '1570101945621-945409a6370f', '1603184017968-953f59cd2e37', '1483478550801-ceba5fe50e8e'
    ],
    Watches: [
        '1712764121254-d9867c694b81', '1660844817855-3ecc7ef21f12', '1508685096489-7aacd43bd3b1', '1617625802912-cde586faf331', '1712999654689-403748d9716d',
        '1579586337278-3befd40fd17a', '1632794716789-42d9995fb5b6', '1553545204-4f7d339aa06a', '1712773496771-28ab8e878957', '1434494343833-76b479733705',
        '1434494571168-ab162bce2813', '1542541864-4abf21a55761', '1669021454166-c68562603897', '1725137801173-1698d4cca0cd', '1694747660463-2d5ab46625d1',
        '1546868871-7041f2a55e12', '1711051476626-1e8c8b79f122', '1517502474097-f9b30659dadb', '1619037961428-e6410a7afd38', '1523755621014-30c8a5029566'
    ],
    Earbuds: [
        '1677838847721-2bf14b48c256', '1572569511254-d8f925fe2cbb', '1627989580309-bfaf3e58af6f', '1606220588913-b3aacb4d2f46', '1675129779575-54b713ec81dc',
        '1667178173387-7e0cb51c0b4f', '1505236273191-1dce886b01e9', '1590658006821-04f4008d5717', '1661963561955-eeaccef3c452', '1722448113450-f6860b7fbfe5',
        '1590658268037-6bf12165a8df', '1606135185526-1bd767d76d65', '1666954642281-a5feb7399cf7', '1606220945770-b5b6c2c55bf1', '1648447272271-1c2292144c50',
        '1631176093617-63490a3d785a', '1682096399825-0f34eb83b817', '1655804484380-51f5a639f2e8', '1613994518041-8cd73527ecc2', '1598371611276-1bc503a270a4'
    ],
    Tablets: [
        '1661580406696-517eb6e5406c', '1672298597883-aba600a9b5a2', '1649150849645-92fba77775a0', '1649150849642-c53366ebb480', '1661421697693-7d5e73fc012b',
        '1628866971124-5d506bf12915', '1744686909434-fd158fca1c35', '1607363775624-81f3f279d9ec', '1661594763621-a235d0d7aede', '1691580438181-6947301d544e',
        '1691580438206-08456840b6de', '1649151139875-ae8ea07082e2', '1661506494267-f326e5cfbefc', '1691580437992-ad2f0ffb8248', '1586874652883-2dbcf09ec5ef',
        '1669691177924-f12fcc3cc540', '1661510500043-50772f8c9b94', '1628591459313-a64214c5bfac', '1624909496706-2105dcc07c43', '1634474588578-7f0565a1cea5'
    ],
    Headphones: [
        '1680955436078-04f1ff5f2554', '1718217028088-a23cb3b277c4', '1652352546025-b41b2bf53ddf', '1737886099638-82bea680e9a9', '1546435770-a3e426ff472b',
        '1737885197886-9e34a03ad226', '1737885197905-5bb7251b267e', '1737885197946-6d9d79dade89', '1677838847545-1ebd2eefb7a0', '1737885197810-c3fae0c438db',
        '1773625545091-e7b18fe46130', '1485192686578-0a70d91accd6', '1682090684966-295afb172e4c', '1634041695335-ee19a4155abd', '1763407178461-2efa5726e241',
        '1646500366920-b4c5ce29237d', '1761241878801-76770a560736', '1598488035252-042a85bc8e5a', '1557231040-038eb8e8cdf2', '1634702688373-6118b7cd6e1b'
    ],
    Cameras: [
        '1674389991678-0836ca77c7f7', '1758109682703-20ac6730351e', '1721310334462-66f07f8e3b1d', '1758109683191-76e3d6e0e2ea', '1769792614592-1ba6668e2083',
        '1758109682768-b958a8f9d251', '1735980968233-0931a7b5ca8c', '1735980968208-1b85bdcd857b', '1674389878114-6a5479a7b86c', '1726994133940-1e029529cc12',
        '1727621170047-4b34851bf8b0', '1727621170067-93835ec80018', '1770674738366-39e47afb7a3f', '1726994133956-e994d84d3d93', '1758109682731-79081e27e673',
        '1758109683112-de123797b54a', '1661389305711-9b1fba63c71b', '1721310334458-bf790715824f', '1720827786918-3870a35fa176', '1721310334467-c74e9eacfb91'
    ],
};

const prefixes = ['Quantum', 'Nebula', 'Apex', 'Zenith', 'Phantom', 'Evo', 'Spectrum', 'Gravity', 'Luna', 'Nova', 'Ultra', 'Pro', 'Max', 'Master', 'Elite', 'Titan', 'Ghost', 'Stellar', 'Core', 'Vortex'];
const brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Asus', 'Nikon', 'Canon', 'Bose', 'Sennheiser', 'Razer', 'Logitech', 'Fujifilm', 'Leica', 'Beats', 'Fossil', 'Casio', 'Tag Heuer'];

const importToTarget = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL for Ultimate Diversity (20-per-category).');

        // 1. Clear current catalog
        await Product.destroy({ where: {}, truncate: { cascade: true } });
        console.log('🗑️  Catalog cleared for unique data enrichment...');

        const finalCatalog = [];

        categories.forEach(cat => {
            const catImages = IMAGE_LIBRARY[cat] || [];
            
            for (let i = 0; i < 20; i++) {
                const brand = brands[Math.floor(Math.random() * brands.length)];
                const prefix = prefixes[i % prefixes.length];
                const imageId = catImages[i % catImages.length];
                
                finalCatalog.push({
                    name: `${brand} ${prefix} ${cat} ${i + 1}`,
                    brand,
                    description: `Experience the cutting-edge ${brand} ${prefix} ${cat}. Designed for unparalleled performance and minimalist beauty.`,
                    price: (Math.random() * 500 + 200).toFixed(2),
                    category: cat,
                    image: `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&q=80&w=1000`,
                    countInStock: 20,
                    specifications: [
                        'Advanced Technology', 
                        'Premium Materials', 
                        '24-Month Warranty', 
                        `Series: ${prefix}`
                    ]
                });
            }
        });

        await Product.bulkCreate(finalCatalog);
        console.log(`✅ SUCCESS! All 140 products are now UNIQUE with different images and names.`);
        process.exit();
    } catch (error) {
        console.error('❌ Enrichment Failed:', error.message);
        process.exit(1);
    }
};

importToTarget();

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 })
  .then(async () => {
    const P = require('./models/Product');
    const total = await P.countDocuments();
    const cats = await P.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    cats.sort((a, b) => b.count - a.count);
    let out = 'Total products: ' + total + '\n\nBy category:\n';
    cats.forEach(c => { out += c._id + ': ' + c.count + '\n'; });
    require('fs').writeFileSync('count.txt', out);
    console.log('Done. Total:', total);
    process.exit(0);
  })
  .catch(e => { console.error(e.message); process.exit(1); });

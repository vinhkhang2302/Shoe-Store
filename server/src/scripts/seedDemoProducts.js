require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/ModelProducts');
const slugify = require('slugify');

const examples = [
    { name: 'Giày chạy bộ nam Air Motion', price: 1250000, type: 1, description: 'Mẫu demo giày chạy bộ nam, đế êm và nhẹ.' },
    { name: 'Giày thể thao nam Street Flex', price: 980000, type: 1, description: 'Mẫu demo giày thể thao nam dùng hằng ngày.' },
    { name: 'Giày sneaker nữ Cloud Walk', price: 1090000, type: 2, description: 'Mẫu demo sneaker nữ nhẹ, phù hợp đi học và đi chơi.' },
    { name: 'Giày thể thao nữ Urban Move', price: 890000, type: 2, description: 'Mẫu demo giày thể thao nữ phong cách năng động.' },
    { name: 'Giày trẻ em Little Runner', price: 650000, type: 3, description: 'Mẫu demo giày trẻ em nhẹ và thoải mái.' },
    { name: 'Giày trẻ em Color Step', price: 590000, type: 3, description: 'Mẫu demo giày trẻ em nhiều màu sắc.' },
];

async function main() {
    try {
        await mongoose.connect(process.env.CONNECT_DB);
        const existing = await Product.countDocuments();
        if (existing > 0) {
            console.log('Đã có ' + existing + ' sản phẩm; không thêm dữ liệu demo để tránh trùng.');
            return;
        }
        const uploadDir = path.resolve(__dirname, '../uploads');
        const images = fs.readdirSync(uploadDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name)).sort();
        if (images.length < examples.length) throw new Error('Không đủ ảnh trong server/src/uploads để tạo sản phẩm demo.');
        const docs = examples.map((product, index) => ({
            ...product,
            slug: slugify(product.name, { lower: true, strict: true }),
            img: images.slice(index * 4, index * 4 + 4),
        }));
        await Product.insertMany(docs);
        console.log('Đã thêm ' + docs.length + ' sản phẩm demo. Ảnh được lấy từ server/src/uploads.');
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((error) => { console.error('Không thể tạo dữ liệu demo:', error.message); process.exitCode = 1; });

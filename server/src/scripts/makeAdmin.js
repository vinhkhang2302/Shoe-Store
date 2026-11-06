require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/ModelUser');

async function main() {
    const email = process.argv[2];
    if (!email) throw new Error('Cách dùng: npm run make-admin -- email-da-dang-ky@example.com');
    try {
        await mongoose.connect(process.env.CONNECT_DB);
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) throw new Error('Không tìm thấy tài khoản. Hãy đăng ký tài khoản trên website trước.');
        if (user.isAdmin) {
            console.log('Tài khoản này đã là admin.');
            return;
        }
        user.isAdmin = true;
        await user.save();
        console.log('Đã cấp quyền admin cho ' + user.email + '.');
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((error) => { console.error('Không thể cấp quyền admin:', error.message); process.exitCode = 1; });

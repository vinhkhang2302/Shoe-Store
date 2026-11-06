const ModelUser = require('../models/ModelUser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');
const ModelPayment = require('../models/ModelPayment');
const ForgotPassword = require('../SendMail/ForgotPassword');
require('dotenv').config();

class ControllerUser {
    async Register(req, res) {
        const { fullname, password, email, phone } = req.body;
        const saltRounds = 10;
        const myPlaintextPassword = password;
        try {
            const dataUser = await ModelUser.findOne({ email: email });
            if (dataUser) {
                return res.status(403).json({ message: 'Người Dùng Đã Tồn Tại !!!' });
            } else {
                bcrypt.hash(myPlaintextPassword, saltRounds, async function (err, hash) {
                    const newUser = new ModelUser({
                        fullname,
                        password: hash,
                        email,
                        phone: phone,
                    });
                    await newUser.save();
                    return res.status(200).json({ message: 'Đăng Ký Thành Công !!!' });
                });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Đã xảy ra lỗi !!!' });
        }
    }

    async Login(req, res, next) {
        const { password, email } = req.body;
        const dataUser = await ModelUser.findOne({ email });
        if (!dataUser) {
            return res.status(401).json({ message: 'Email Hoặc Mật Không Chính Xác !!!' });
        }
        const match = await bcrypt.compare(password, dataUser.password);
        if (match) {
            const admin = dataUser.isAdmin;
            const token = jwt.sign({ email, admin }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });
            const refreshToken = jwt.sign({ email, admin }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.cookie('Token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: process.env.NODE_ENV === 'production', // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });

            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: process.env.NODE_ENV === 'production', // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });

            // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            return res.status(200).json({ message: 'Đăng Nhập Thành Công !!!' });
        } else {
            return res.status(401).json({ message: 'Email Hoặc Mật Khẩu Không Chính Xác !!!' });
        }
    }

    async GetUser(req, res) {
        try {
            const dataUser = await ModelUser.findOne({ email: req.user.email }).select('fullname email phone address isAdmin surplus');
            if (!dataUser) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
            return res.status(200).json(dataUser);
        } catch (error) { return res.status(500).json({ message: 'Không thể tải thông tin tài khoản' }); }
    }

    async UpdateProfile(req, res) {
        try {
            const fullname = String(req.body.fullname || '').trim();
            const phoneText = String(req.body.phone || '').replace(/\D/g, '').replace(/^0/, '');
            const address = String(req.body.address || '').trim();
            if (fullname.length < 2 || fullname.length > 80) return res.status(400).json({ message: 'Tên phải có từ 2 đến 80 ký tự' });
            if (phoneText && !/^\d{9,10}$/.test(phoneText)) return res.status(400).json({ message: 'Số điện thoại cần có 9 hoặc 10 chữ số' });
            if (address.length > 250) return res.status(400).json({ message: 'Địa chỉ tối đa 250 ký tự' });
            const user = await ModelUser.findOneAndUpdate({ email: req.user.email }, {
                $set: { fullname, phone: phoneText ? Number(phoneText) : 0, address },
            }, { new: true, runValidators: true }).select('fullname email phone address isAdmin surplus');
            if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
            return res.status(200).json({ message: 'Cập nhật thông tin thành công', user });
        } catch (error) { return res.status(500).json({ message: 'Không thể cập nhật thông tin' }); }
    }

    async Logout(req, res) {
        res.clearCookie('Token');
        res.clearCookie('logged');
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Đăng Xuất Thành Công !!!' });
    }

    async GetOrder(req, res) {
        ModelPayment.find({}).then((data) => res.status(200).json(data));
    }
    async ForgotPassword(req, res) {
        const dataUser = await ModelUser.findOne({ email: req.body.email });
        if (!dataUser) {
            return res.status(404).json({ message: 'Không Tìm Thấy Người Dùng !!!' });
        }
        const SECRET_KEY = process.env.JWT_SECRET;
        const OTP_EXPRIRY = '15m';
        const email = req.body.email;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const token = jwt.sign({ email, otp }, SECRET_KEY, { expiresIn: OTP_EXPRIRY });
        try {
            await ForgotPassword(email, token, otp);
            return res.status(200).json({ message: 'Mã OTP đã được gửi đến email' });
        } catch (error) {
            console.error('Password reset email failed:', error.message);
            return res.status(503).json({ message: 'Không gửi được email OTP. Hãy kiểm tra cấu hình email.' });
        }
    }

    async ResetPassword(req, res) {
        const SECRET_KEY = process.env.JWT_SECRET;
        const { token, otp, newPassword } = req.body;

        try {
            if (!token || !otp || typeof newPassword !== 'string' || newPassword.length < 8) {
                return res.status(400).json({ message: 'Vui lòng nhập OTP và mật khẩu mới tối thiểu 8 ký tự' });
            }
            const decoded = jwt.verify(token, SECRET_KEY);
            if (decoded.otp !== String(otp)) return res.status(401).json({ message: 'OTP không chính xác' });
            const hashPassword = await bcrypt.hash(newPassword, 10);
            await ModelUser.updateOne({ email: decoded.email }, { password: hashPassword });
            return res.status(200).json({ message: 'Khôi phục mật khẩu thành công' });
        } catch (error) { return res.status(401).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' }); }
    }

    async getAllUser(req, res) {
        ModelUser.find({}).then((data) => res.status(200).json(data));
    }

    async DeleteUser(req, res) {
        const { id } = req.query;
        const findUser = await ModelUser.findOne({ _id: id });
        if (!findUser) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        if (findUser.email === req.user.email) {
            return res.status(400).json({ message: 'Không thể xóa chính mình !!!' });
        }
        if (findUser.isAdmin === true) {
            return res.status(400).json({ message: 'Không thể xóa Admin !!!' });
        }
        await ModelUser.deleteOne({ _id: id });
        return res.status(200).json({ message: 'Xóa Người Dùng Thành Công !!!' });
    }

    async RefreshToken(req, res) {
        const token = req.cookies;
        const decoded = jwtDecode(token.refreshToken);
        const newToken = jwt.sign({ email: decoded.email, admin: decoded.admin }, process.env.JWT_SECRET, {
            expiresIn: process.env.EXPIRES_IN,
        });
        return res.setHeader('Set-Cookie', `Token=${newToken}  ; max-age=360000 ;path=/`).json({
            message: 'Đăng Nhập Thành Công !!!',
        });
    }
}

module.exports = new ControllerUser();

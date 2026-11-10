const mongoose = require('mongoose');
const ModelCart = require('../models/ModelCart');
const ModelPayment = require('../models/ModelPayment');
const ModelUser = require('../models/ModelUser');
const sendMailOrder = require('../SendMail/SendMailOrder');

const validCart = (cart) => cart && Array.isArray(cart.products) && cart.products.length > 0;
const cartTotal = (cart) => cart.products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);
const paymentProducts = (cart) => cart.products.map(({ nameProduct, quantity, price, size, img, type }) => ({
    nameProduct, quantity, price, size, img, type,
}));

async function notifyOrder(email) {
    try {
        await sendMailOrder(email);
        return true;
    } catch (error) {
        console.error('Order was saved, but its confirmation email failed:', error.message);
        return false;
    }
}

class ControllerPayments {
    async getPayment(req, res) {
        try {
            const payment = await ModelPayment.findOne({ user: req.user.email }).sort({ _id: -1 });
            return res.status(200).json(payment ? [payment] : []);
        } catch (error) { return res.status(500).json({ message: 'Không thể tải đơn hàng' }); }
    }

    async PaymentCod(req, res) {
        try {
            const email = req.user.email;
            const cart = await ModelCart.findOne({ user: email });
            if (!validCart(cart)) return res.status(404).json({ message: 'Giỏ hàng đang trống' });
            if (!cart.address || !cart.name || !cart.phone) return res.status(400).json({ message: 'Vui lòng điền đủ thông tin nhận hàng' });
            const user = await ModelUser.findOne({ email });
            if (!user) return res.status(401).json({ message: 'Không tìm thấy tài khoản' });
            const payment = new ModelPayment({ products: paymentProducts(cart), sumprice: cartTotal(cart),
                tinhtrang: false, trangthai: false, user: email, address: cart.address,
                phone: cart.phone, username: user.fullname, typePayments: 'COD' });
            await payment.save();
            await ModelCart.deleteOne({ _id: cart._id });
            const emailSent = await notifyOrder(email);
            return res.status(200).json({ message: 'Đặt hàng thành công', emailSent });
        } catch (error) {
            console.error('COD order failed:', error.message);
            return res.status(500).json({ message: 'Không thể tạo đơn hàng' });
        }
    }

    async getPayments(req, res) {
        try { return res.status(200).json(await ModelPayment.find({ user: req.user.email }).sort({ _id: -1 })); }
        catch (error) { return res.status(500).json({ message: 'Không thể tải đơn hàng' }); }
    }

    async GetOrderUser(req, res) {
        try { return res.status(200).json((await ModelPayment.find({})).map((item) => item.products)); }
        catch (error) { return res.status(500).json({ message: 'Không thể tải dữ liệu doanh thu' }); }
    }

    async CancelOrder(req, res) {
        try {
            const { id } = req.body;
            if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
            const payment = await ModelPayment.findById(id);
            if (!payment) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            if (payment.user !== req.user.email) {
                const actor = await ModelUser.findOne({ email: req.user.email }).select('isAdmin');
                if (!actor?.isAdmin) return res.status(403).json({ message: 'Bạn không có quyền hủy đơn này' });
            }
            if (payment.tinhtrang) return res.status(409).json({ message: 'Không thể hủy đơn đã giao' });
            if (payment.trangthai) return res.status(409).json({ message: 'Đơn đã thanh toán; cần xử lý hoàn tiền trước khi hủy' });
            await payment.deleteOne();
            return res.status(200).json({ message: 'Hủy đơn hàng thành công' });
        } catch (error) { return res.status(500).json({ message: 'Không thể hủy đơn hàng' }); }
    }
}

module.exports = new ControllerPayments();

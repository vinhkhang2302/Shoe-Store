const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const ModelCart = require('../models/ModelCart');
const ModelPayment = require('../models/ModelPayment');
const ModelUser = require('../models/ModelUser');
const sendMailOrder = require('../SendMail/SendMailOrder');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
require('dotenv').config();

const clientUrl = () => process.env.REACT_APP_URL_DOMAIN || 'http://localhost:3000';
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

function verifyMomoSignature(data) {
    if (!process.env.MOMO_SECRET_KEY || !process.env.MOMO_ACCESS_KEY || !data.signature) return false;
    const fields = ['accessKey', 'amount', 'extraData', 'message', 'orderId', 'orderInfo', 'orderType', 'partnerCode', 'payType', 'requestId', 'responseTime', 'resultCode', 'transId'];
    const raw = fields.filter((key) => data[key] !== undefined).map((key) => `${key}=${data[key]}`).join('&');
    const expected = crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY).update(raw).digest('hex');
    const received = String(data.signature);
    return received.length === expected.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

function createVnpay() {
    const { VNPAY_TMN_CODE, VNPAY_SECURE_SECRET, VNPAY_HOST } = process.env;
    if (!VNPAY_TMN_CODE || !VNPAY_SECURE_SECRET || !VNPAY_HOST) throw new Error('VNPAY configuration is missing');
    return new VNPay({ tmnCode: VNPAY_TMN_CODE, secureSecret: VNPAY_SECURE_SECRET, vnpayHost: VNPAY_HOST,
        testMode: VNPAY_HOST.includes('sandbox'), hashAlgorithm: 'SHA512', loggerFn: ignoreLogger });
}

async function finalizeVnpayPayment(result) {
    const txnRef = String(result.vnp_TxnRef || '');
    const gatewayOrderId = `VNPAY:${txnRef}`;
    const existing = await ModelPayment.findOne({ gatewayOrderId });
    if (existing) return { alreadyProcessed: true };
    if (!txnRef || txnRef.length > 100 || Number(result.vnp_Amount) <= 0) {
        return { error: 'invalid_order' };
    }
    const cart = await ModelCart.findOne({ vnpayTxnRef: txnRef });
    const amount = Number(result.vnp_Amount);
    if (!validCart(cart) || cart.vnpayTxnRef !== txnRef
        || Number(cart.vnpayAmount) !== amount || cartTotal(cart) !== amount) {
        return { error: 'invalid_amount' };
    }
    const user = await ModelUser.findOne({ email: cart.user });
    if (!user) return { error: 'missing_user' };
    try {
        await ModelPayment.create({
            gatewayOrderId, products: paymentProducts(cart), sumprice: amount,
            address: cart.address, phone: cart.phone, typePayments: 'VNPAY',
            username: user.fullname, tinhtrang: false, trangthai: true, user: cart.user,
        });
    } catch (error) {
        if (error.code === 11000) return { alreadyProcessed: true };
        throw error;
    }    await ModelCart.deleteOne({ _id: cart._id });
    await notifyOrder(cart.user);
    return { alreadyProcessed: false };
}
class ControllerPayments {
    async PaymentsMomo(req, res) {
        try {
            const email = req.user.email;
            const cart = await ModelCart.findOne({ user: email });
            if (!validCart(cart)) return res.status(404).json({ message: 'Giỏ hàng đang trống' });
            if (!cart.address || !cart.name || !cart.phone) return res.status(400).json({ message: 'Vui lòng điền đủ thông tin nhận hàng' });
            const { MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_GATEWAY_URL, MOMO_REDIRECT_URL, MOMO_IPN_URL } = process.env;
            if (![MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_GATEWAY_URL, MOMO_REDIRECT_URL, MOMO_IPN_URL].every(Boolean)) {
                return res.status(503).json({ message: 'Chưa cấu hình đầy đủ MoMo trong server/.env' });
            }
            const requestId = `${MOMO_PARTNER_CODE}${Date.now()}`;
            const orderId = requestId;
            const amount = cartTotal(cart);
            const requestType = 'captureWallet';
            const extraData = Buffer.from(cart.address, 'utf8').toString('base64');
            const raw = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_IPN_URL}&orderId=${orderId}&orderInfo=${email}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${MOMO_REDIRECT_URL}&requestId=${requestId}&requestType=${requestType}`;
            const signature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(raw).digest('hex');
            const response = await axios.post(MOMO_GATEWAY_URL, {
                partnerCode: MOMO_PARTNER_CODE, accessKey: MOMO_ACCESS_KEY, requestId, amount, orderId,
                orderInfo: email, redirectUrl: MOMO_REDIRECT_URL, ipnUrl: MOMO_IPN_URL, extraData,
                requestType, signature, lang: 'vi',
            }, { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
            cart.momoOrderId = orderId;
            cart.momoRequestId = requestId;
            cart.momoAmount = Number(amount);
            await cart.save();
            return res.status(200).json(response.data);
        } catch (error) {
            console.error('MoMo initiation failed:', error.response?.data || error.message);
            return res.status(502).json({ message: 'Không thể khởi tạo thanh toán MoMo' });
        }
    }

    async paymentVnpay(req, res) {
        try {
            const cart = await ModelCart.findOne({ user: req.user.email });
            if (!validCart(cart)) return res.status(404).json({ message: 'Giỏ hàng đang trống' });
            if (!cart.address || !cart.name || !cart.phone) return res.status(400).json({ message: 'Vui lòng điền đủ thông tin nhận hàng' });
            const vnpay = createVnpay();
            const txnRef = `${Date.now()}${crypto.randomBytes(6).toString('hex')}`;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const paymentUrl = await vnpay.buildPaymentUrl({
                vnp_Amount: cartTotal(cart), vnp_IpAddr: req.ip || '127.0.0.1', vnp_TxnRef: txnRef,
                vnp_OrderInfo: txnRef, vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: process.env.VNPAY_RETURN_URL, vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: dateFormat(new Date()), vnp_ExpireDate: dateFormat(tomorrow),
            });
            cart.vnpayTxnRef = txnRef;
            cart.vnpayAmount = cartTotal(cart);
            await cart.save();
            return res.status(201).json({ vnpayResponse: paymentUrl });
        } catch (error) {
            console.error('VNPay initiation failed:', error.message);
            return res.status(503).json({ message: 'Không thể khởi tạo VNPay; hãy kiểm tra cấu hình trong server/.env' });
        }
    }

    async checkPaymentVnpay(req, res) {
        try {
            const result = createVnpay().verifyReturnUrl(req.query);
            if (!result.isVerified || result.vnp_TmnCode !== process.env.VNPAY_TMN_CODE) {
                return res.status(400).send('Chữ ký VNPay không hợp lệ');
            }
            if (!result.isSuccess) return res.redirect(`${clientUrl()}/payments?payment=failed`);
            const finalized = await finalizeVnpayPayment(result);
            if (finalized.error) return res.status(400).send('Không khớp đơn hàng hoặc số tiền VNPay');
            return res.redirect(`${clientUrl()}/paymentsuccess`);
        } catch (error) {
            console.error('VNPay return rejected:', error.message);
            return res.status(400).send('Không thể xác minh callback VNPay');
        }
    }

    async checkVnpayIpn(req, res) {
        try {
            const result = createVnpay().verifyIpnCall(req.query);
            if (!result.isVerified || result.vnp_TmnCode !== process.env.VNPAY_TMN_CODE) {
                return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
            }
            if (String(result.vnp_ResponseCode) !== '00' || String(result.vnp_TransactionStatus) !== '00') {
                return res.status(200).json({ RspCode: '00', Message: 'Payment not successful' });
            }
            const finalized = await finalizeVnpayPayment(result);
            if (finalized.error === 'invalid_order' || finalized.error === 'missing_user') {
                return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
            if (finalized.error === 'invalid_amount') {
                return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
            }
            if (finalized.alreadyProcessed) {
                return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
            }
            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        } catch (error) {
            console.error('VNPay IPN rejected:', error.message);
            return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
        }
    }
    async checkData(req, res) {
        const data = req.method === 'POST' ? req.body : req.query;
        try {
            if (!verifyMomoSignature(data) || data.partnerCode !== process.env.MOMO_PARTNER_CODE) {
                return res.status(401).send('Chữ ký MoMo không hợp lệ');
            }
            const email = String(data.orderInfo || '');
            const cart = await ModelCart.findOne({ user: email });
            if (String(data.resultCode) !== '0') {
                if (cart && cart.momoOrderId === String(data.orderId)) {
                    cart.momoOrderId = undefined; cart.momoRequestId = undefined; cart.momoAmount = undefined; await cart.save();
                }
                return req.method === 'POST'
                    ? res.status(204).end()
                    : res.redirect(`${clientUrl()}/payments?payment=failed`);
            }
            const prior = await ModelPayment.findOne({ gatewayOrderId: String(data.orderId) });
            if (prior) {
                return req.method === 'POST'
                    ? res.status(204).end()
                    : res.redirect(`${clientUrl()}/paymentsuccess`);
            }
            const amount = Number(data.amount);
            const extraData = Buffer.from(String(data.extraData || ''), 'base64').toString('utf8');
            if (!cart || !validCart(cart) || cart.momoOrderId !== String(data.orderId) || cart.momoRequestId !== String(data.requestId)
                || Number(cart.momoAmount) !== amount || cartTotal(cart) !== amount || cart.address !== extraData) {
                return res.status(400).send('Không khớp giỏ hàng hoặc số tiền MoMo');
            }
            const user = await ModelUser.findOne({ email });
            if (!user) return res.status(400).send('Không tìm thấy tài khoản đặt hàng');
            const payment = new ModelPayment({
                gatewayOrderId: String(data.orderId), products: paymentProducts(cart), sumprice: amount,
                tinhtrang: false, trangthai: true, user: email, address: cart.address,
                phone: cart.phone, username: user.fullname, typePayments: 'MOMO',
            });
            await payment.save();
            await ModelCart.deleteOne({ _id: cart._id });
            await notifyOrder(email);
            return req.method === 'POST'
                ? res.status(204).end()
                : res.redirect(`${clientUrl()}/paymentsuccess`);
        } catch (error) {
            console.error('MoMo callback rejected:', error.message);
            return res.status(400).send('Không thể xử lý callback MoMo');
        }
    }

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

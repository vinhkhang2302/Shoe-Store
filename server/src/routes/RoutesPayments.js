const express = require('express');
const router = express.Router();

const ControllerPayments = require('../controllers/ControllerPayments');
const ControllerJWT = require('../jwt/ControllerJWT');

router.post('/api/payment', ControllerJWT.verifyToken, ControllerPayments.PaymentsMomo);
router.get('/api/checkdata', ControllerPayments.checkData);
router.post('/api/checkdata', ControllerPayments.checkData);
router.get('/api/payment', ControllerJWT.verifyToken, ControllerPayments.getPayment);
router.post('/api/paymentcod', ControllerJWT.verifyToken, ControllerPayments.PaymentCod);
router.get('/api/payments', ControllerJWT.verifyToken, ControllerPayments.getPayments);
router.get('/api/dataorderuser', ControllerJWT.verifyTokenAdmin, ControllerPayments.GetOrderUser);
router.post('/api/cancelorder', ControllerJWT.verifyToken, ControllerPayments.CancelOrder);
router.post('/api/paymentvnpay', ControllerJWT.verifyToken, ControllerPayments.paymentVnpay);
router.get('/api/check-payment-vnpay', ControllerPayments.checkPaymentVnpay);
router.get('/api/check-vnpay-ipn', ControllerPayments.checkVnpayIpn);

module.exports = router;

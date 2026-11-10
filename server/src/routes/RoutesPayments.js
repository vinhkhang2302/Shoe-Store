const express = require('express');
const router = express.Router();

const ControllerPayments = require('../controllers/ControllerPayments');
const ControllerJWT = require('../jwt/ControllerJWT');

router.get('/api/payment', ControllerJWT.verifyToken, ControllerPayments.getPayment);
router.post('/api/paymentcod', ControllerJWT.verifyToken, ControllerPayments.PaymentCod);
router.get('/api/payments', ControllerJWT.verifyToken, ControllerPayments.getPayments);
router.get('/api/dataorderuser', ControllerJWT.verifyTokenAdmin, ControllerPayments.GetOrderUser);
router.post('/api/cancelorder', ControllerJWT.verifyToken, ControllerPayments.CancelOrder);

module.exports = router;

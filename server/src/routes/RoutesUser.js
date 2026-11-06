const express = require('express');
const router = express.Router();

const ControllerUser = require('../controllers/ControllerUsers');
const ControllerJWT = require('../jwt/ControllerJWT');

router.post('/api/register', ControllerUser.Register);
router.post('/api/login', ControllerUser.Login);
router.get('/api/auth', ControllerJWT.verifyToken, ControllerUser.GetUser);
router.put('/api/profile', ControllerJWT.verifyToken, ControllerUser.UpdateProfile);
router.post('/api/logout', ControllerJWT.verifyToken, ControllerUser.Logout);
router.get('/api/getallorder', ControllerJWT.verifyTokenAdmin, ControllerUser.GetOrder);
router.post('/api/forgotpassword', ControllerUser.ForgotPassword);
router.post('/api/resetpassword', ControllerUser.ResetPassword);
router.get('/api/refresh-token', ControllerUser.RefreshToken);

router.get('/api/getalluser', ControllerJWT.verifyTokenAdmin, ControllerUser.getAllUser);
router.delete('/api/deleteuser', ControllerJWT.verifyTokenAdmin, ControllerUser.DeleteUser);

module.exports = router;

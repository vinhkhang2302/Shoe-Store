const ProductsRoutes = require('./ProductsRoutes');
const UserRoute = require('./RoutesUser');
const CartRoute = require('./RoutesCart');
const PaymentsRoutes = require('./RoutesPayments');
const ControllerJWT = require('../jwt/ControllerJWT');

function route(app) {
    app.use(ProductsRoutes);
    app.use(UserRoute);
    app.use(CartRoute);
    app.use(PaymentsRoutes);

    app.get('/api/admin', ControllerJWT.verifyTokenAdmin, (req, res) => {
        return res.status(200).json({ message: 'Bạn có quyền truy cập' });
    });
}

module.exports = route;

import App from '../App';
import Admin from '../Pages/Admin';
import Cart from '../Pages/Cart';
import Category from '../Pages/Category';
import DetailProducts from '../Pages/DetailProducts';
import InfoUser from '../Pages/InfoUser';
import LoginUser from '../Pages/Login';
import PaymentSuccess from '../Pages/PaymentSuccess';
import Payments from '../Pages/Payments';
import RegisterUser from '../Pages/RegisterUser';
import ForgotPassword from '../Pages/ForgotPassword';
import { AdminOnly, CustomerOnly } from './RoleRoutes';

export const publicRoute = [
    { path: '/', element: <CustomerOnly><App /></CustomerOnly> },
    { path: '/product/:id/:slug', element: <CustomerOnly><DetailProducts /></CustomerOnly> },
    { path: '/category', element: <CustomerOnly><Category /></CustomerOnly> },
    { path: '/cart', element: <CustomerOnly><Cart /></CustomerOnly> },
    { path: '/payments', element: <CustomerOnly><Payments /></CustomerOnly> },
    { path: '/login', element: <CustomerOnly><LoginUser /></CustomerOnly> },
    { path: '/register', element: <CustomerOnly><RegisterUser /></CustomerOnly> },
    { path: '/info', element: <CustomerOnly><InfoUser /></CustomerOnly> },
    { path: '/admin', element: <AdminOnly><Admin /></AdminOnly> },
    { path: '/category/:slug', element: <CustomerOnly><Category /></CustomerOnly> },
    { path: '/paymentsuccess', element: <CustomerOnly><PaymentSuccess /></CustomerOnly> },
    { path: '/forgotpassword', element: <CustomerOnly><ForgotPassword /></CustomerOnly> },
    { path: '*', element: <CustomerOnly><App /></CustomerOnly> },
];

export const privateRoute = [{ path: '/admin', element: <Admin /> }];

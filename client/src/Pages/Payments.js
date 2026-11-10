import classNames from 'classnames/bind';
import styles from '../Styles/Payments.module.scss';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import axios from 'axios';
import request, { requestUpdateInfoCart } from '../Config/api';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

const cx = classNames.bind(styles);

function Payments() {
    const [dataCart, setDataCart] = useState([]);
    const [tinhthanh, setTinhThanh] = useState([]);
    const [idTinhThanh, setIdTinhThanh] = useState(0);
    const [huyen, setHuyen] = useState([]);
    const [idHuyen, setIdHuyen] = useState(0);
    const [xa, setXa] = useState([]);
    const [address, setAddress] = useState('');
    const [dataProducts, setDataProducts] = useState([]);

    const [dataLengthProducts, setDataLengthProducts] = useState(0);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const navigate = useNavigate();

    const { getCart } = useStore();

    const totalProduct = useMemo(() => {
        const total = dataCart.map((item) => item.sumprice);
        return total[0];
    }, [dataCart]);

    useEffect(() => {
        axios.get('https://esgoo.net/api-tinhthanh/1/0.htm').then((res) => setTinhThanh(res.data.data));
    }, []);

    useEffect(() => {
        if (idTinhThanh !== 0) {
            axios.get(`https://esgoo.net/api-tinhthanh/2/${idTinhThanh}.htm`).then((res) => setHuyen(res.data.data));
        }
    }, [idTinhThanh]);

    useEffect(() => {
        if (idHuyen !== 0) {
            axios.get(`https://esgoo.net/api-tinhthanh/3/${idHuyen}.htm`).then((res) => setXa(res.data.data));
        }
    }, [idHuyen]);

    useEffect(() => {
        const newDataProducts = dataCart?.map((item) => item.products);
        setDataProducts(newDataProducts[0]);
    }, [dataCart]);

    useEffect(() => {
        let active = true;
        request
            .get('/api/cart')
            .then((res) => {
                if (active) setDataCart(Array.isArray(res.data) ? res.data : []);
            })
            .catch((error) => {
                if (!active) return;
                if (error.response?.status === 401) {
                    navigate('/login', { replace: true });
                    return;
                }
                setDataCart([]);
                toast.error(error.response?.data?.message || 'Không thể tải giỏ hàng. Vui lòng thử lại.');
            });

        return () => {
            active = false;
        };
    }, [navigate]);

    const handlePayment = async () => {
        try {
            if (!name.trim() || !phone.trim() || !address.trim()) {
                toast.error('Vui lòng điền họ tên, số điện thoại và địa chỉ nhận hàng.');
                return;
            }
            if (!dataProducts?.length) {
                toast.error('Giỏ hàng đang trống. Vui lòng quay lại chọn sản phẩm.');
                return;
            }

            await requestUpdateInfoCart({ name: name.trim(), phone: phone.trim(), address: address.trim() });
            const res = await request.post('/api/paymentcod', { dataProducts, address });
            toast.success(res.data.message);
            await getCart();
            navigate('/paymentsuccess');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        }
    };
    useEffect(() => {
        // Tính tổng số lượng sản phẩm trong giỏ hàng
        const totalQuantity = dataCart?.reduce((total, cartItem) => {
            return total + cartItem.products.reduce((sum, product) => sum + product.quantity, 0);
        }, 0);

        // Cập nhật lại số lượng sản phẩm
        setDataLengthProducts(totalQuantity);
    }, [dataCart]); // Chạy lại khi dataCart thay đổi

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <h2>Thanh toán</h2>
                <div className={cx('form-payments')}>
                    <div className={cx('column-left')}>
                        <h3>THÔNG TIN THANH TOÁN</h3>
                        <div className={cx('form-1')}>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="floatingInput"
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <label htmlFor="floatingInput">Họ và tên *</label>
                            </div>
                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="floatingPassword"
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <label htmlFor="floatingPassword">Số điện thoại *</label>
                            </div>
                        </div>

                        <div>
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" id="floatingInput" />
                                <label htmlFor="floatingInput">Địa chỉ email *</label>
                            </div>
                            <select
                                className="form-select"
                                aria-label="Default select example"
                                selected
                                onChange={(e) => setIdTinhThanh(e.target.value)}
                            >
                                <option value="0">Tỉnh/Thành</option>
                                {tinhthanh.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                onChange={(e) => setIdHuyen(e.target.value)}
                                className="form-select mt-3"
                                aria-label="Default select example"
                            >
                                <option value="0">Quận/Huyện</option>
                                {huyen.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            <select className="form-select mt-3" aria-label="Default select example">
                                <option value="0">Xã/Phường/Thị trấn</option>
                                {xa.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="form-floating mt-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="floatingInput"
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                <label htmlFor="floatingInput">Địa Chỉ *</label>
                            </div>
                        </div>

                        <div className="form-floating mt-3">
                            <textarea
                                style={{ height: '100px' }}
                                className="form-control"
                                placeholder="Leave a comment here"
                                id="floatingTextarea"
                            ></textarea>
                            <label htmlFor="floatingTextarea">Ghi Chú Đơn Hàng</label>
                        </div>

                        <div className={cx('select-payment')}>
                            <h4>PHƯƠNG THỨC THANH TOÁN</h4>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    id="payment-cod"
                                    checked
                                    readOnly
                                />
                                <label className={`form-check-label ${cx('payment-method-label')}`} htmlFor="payment-cod">
                                    Thanh Toán Khi Nhận Hàng
                                </label>
                            </div>
                            <p className={cx('payment-demo-note')}>
                                Bản demo hiện chỉ hỗ trợ thanh toán khi nhận hàng (COD). MoMo và VNPay chưa được tích hợp.
                            </p>
                            <div onClick={handlePayment} className={cx('btn-payment')}>
                                <button id={cx('btn-buy')}>Hoàn Tất Đơn Hàng</button>
                            </div>
                        </div>

                        <div></div>
                    </div>
                    <div className={cx('total-product')}>
                        <h3>TỔNG CỘNG | {dataLengthProducts} SẢN PHẨM</h3>
                        <div>
                            <table className="table table-bordered border-primary">
                                <thead>
                                    <tr>
                                        <th scope="col">Tạm tính</th>
                                        <th scope="col">{totalProduct?.toLocaleString()}đ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Phí Vận Chuyển</td>
                                        <td>Miễn phí vận chuyển</td>
                                    </tr>
                                    <tr>
                                        <td>Tổng Cộng</td>
                                        <th>{totalProduct?.toLocaleString()}đ</th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={cx('img-product')}>
                            <h4>SẢN PHẨM ĐÃ ĐẶT HÀNG</h4>
                            <div className={cx('img')}>
                                {dataProducts?.map((item) => (
                                    <img
                                        key={item.id}
                                        src={`${process.env.REACT_APP_IMG}/${item.img}`}
                                        alt={item.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Payments;

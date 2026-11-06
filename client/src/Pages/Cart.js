import classNames from 'classnames/bind';
import styles from '../Styles/Cart.module.scss';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import request, { requestUpdateInfoCart } from '../Config/api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from '../hooks/useStore';

const cx = classNames.bind(styles);

function Cart() {
    const [dataProducts, setDataProducts] = useState([]);

    const navigate = useNavigate();

    const [lengthCart, setLengthCart] = useState(0);

    const [dataLengthProducts, setDataLengthProducts] = useState(0);

    const { dataCart, getCart } = useStore();

    const token = document.cookie;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const totalProduct = useMemo(() => {
        const total = dataCart?.map((item) => item.sumprice);
        return total;
    }, [dataCart]);

    useEffect(() => {
        const newDataProducts = dataCart?.map((item) => item.products);
        setDataProducts(newDataProducts[0]);
    }, [dataCart]);

    const handleDeleteCart = async (id) => {
        await request.post('/api/deletecart', { id }).then((res) => toast.success(res.data.message));
        getCart();
    };

    useEffect(() => {
        // Tính tổng số lượng sản phẩm trong giỏ hàng
        const totalQuantity = dataCart?.reduce((total, cartItem) => {
            return total + cartItem.products.reduce((sum, product) => sum + product.quantity, 0);
        }, 0);

        // Cập nhật lại số lượng sản phẩm
        setDataLengthProducts(totalQuantity);
    }, [dataCart]); // Chạy lại khi dataCart thay đổi

    const nextPage = () => {
        if (dataProducts.length > 0) {
            setTimeout(() => {
                navigate('/payments');
            }, 1000);
        } else {
            toast.error('Vui lòng thêm sản phẩm vào giỏ hàng để thanh toán !!!');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header>
                <Header lengthCart={lengthCart} />
            </header>

            <main className={cx('main')}>
                <h2>Giỏ Hàng</h2>
                <div className={cx('inner')}>
                    {dataCart.length > 0 ? (
                        <div>
                            {dataProducts?.map((item, index) => (
                                <div key={index} className={cx('cart-products')}>
                                    <div className={cx('img-product')}>
                                        <img src={`${process.env.REACT_APP_IMG}/${item?.img}`} alt="" />
                                    </div>

                                    <div className={cx('info-product')}>
                                        <h2>{item?.nameProduct}</h2>

                                        <span style={{ fontSize: '17px', fontWeight: '700' }}>
                                            Số Lượng: x{item?.quantity}
                                        </span>
                                        <span style={{ fontSize: '17px', fontWeight: '700' }}>Size: {item?.size}</span>
                                        <span id={cx('price')}>
                                            {(item?.price * item?.quantity).toLocaleString()} đ
                                        </span>
                                    </div>

                                    <div className={cx('remove-product')}>
                                        <button onClick={() => handleDeleteCart(item?._id)}>
                                            <FontAwesomeIcon icon={faClose} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={cx('no-product')}>
                            <img src="https://static.topcv.vn/v4/image/job-list/none-result.png" alt="" />
                            <span>Bạn Chưa Có Sản Phẩm Nào</span>
                        </div>
                    )}

                    <div className={cx('total-product')}>
                        <h3>TỔNG CỘNG | {dataLengthProducts} SẢN PHẨM</h3>
                        <div>
                            <table className="table table-bordered border-primary">
                                <thead>
                                    <tr>
                                        <th scope="col">Tạm tính</th>
                                        <th scope="col">{totalProduct.toLocaleString()} đ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Phí Vận Chuyển</td>
                                        <td>Miễn phí vận chuyển</td>
                                    </tr>
                                    <tr>
                                        <td>Tổng Cộng</td>
                                        <th>{totalProduct.toLocaleString()} đ</th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={cx('btn-total')}>
                            <button id={cx('btn-buy')}>
                                <Link onClick={nextPage}>Tiến hành thanh toán</Link>
                            </button>
                            <button id={cx('btn-continue')}>
                                <Link to={'/category'}>Tiếp tục mua sắm</Link>
                            </button>
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

export default Cart;

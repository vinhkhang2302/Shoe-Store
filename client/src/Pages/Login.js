import classNames from 'classnames/bind';
import styles from '../Styles/Login.module.scss';
// import Header from '../Components/Header';
import request from '../Config/api';

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

const cx = classNames.bind(styles);

function LoginUser() {
    const [email, setEmail] = useState(''); // Tạo state để lưu email
    const [password, setPassword] = useState(''); // Tạo state để lưu password
    const handleLoginUser = async () => {
        try {
            if (!email || !password) {
                toast.error('Vui lòng nhập đầy đủ email và mật khẩu!');
                return;
            }

            // Nếu bạn thực sự cần kiểm tra email KHÔNG được chứa chữ in hoa:
            const pattern = /[A-Z]/;
            if (pattern.test(email)) {
                toast.error('Email không được chứa chữ in hoa!');
                return;
            }

            // Thực hiện đăng nhập
            const res = await request.post('/api/login', {
                email,
                password,
            });

            toast.success(res.data.message || 'Đăng nhập thành công!');
            window.location.replace('/');
        } catch (error) {
            const message = error?.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!';
            toast.error(message);
        }
    };

    return (
        <>
            <div className={cx('body-wrapper')}>
                <ToastContainer />
                {/* <header>
                <Header />
            </header> */}
                <div className={cx('wrapper')}>
                    <div className={cx('inner')}>
                        <div className={cx('header-form-login')}>
                            <span>Đăng nhập</span>
                            <p>Vui lòng đăng nhập để nhận thêm nhiều ưu đãi</p>
                        </div>
                        <div className={cx('input-box')}>
                            <div className={cx('form-input')}>
                                <label>Tên tài khoản hoặc Email đăng nhập</label>
                                <input
                                    placeholder="Nhập Tài Khoản / Email"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className={cx('form-input')}>
                                <label>Mật khẩu</label>
                                <input
                                    placeholder="Nhập Mật Khẩu"
                                    type="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button className={cx('btn-login')} onClick={handleLoginUser}>
                                Đăng nhập
                            </button>

                            <div className={cx('single-input-fields')}>
                                <div>
                                    <input type="checkbox" />
                                    <label>Duy trì đăng nhập</label>
                                </div>
                                <Link to={'/forgotPassword'}>Quên mật khẩu?</Link>
                            </div>
                        </div>
                        <div className={cx('login-footer')}>
                            <p className="mb-0">
                                Bạn chưa có tài khoản ?{' '}
                                <Link id={cx('link')} to="/register">
                                    Đăng ký
                                </Link>{' '}
                                ngay
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginUser;

import classNames from 'classnames/bind';
import styles from '../Styles/InfoUser.module.scss';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import request from '../Config/api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faMoneyCheckDollar, faPhone } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function InfoUser() {
    const [dataUser, setDataUser] = useState({});
    const [dataPayments, setDataPayments] = useState([]);
    const [profile, setProfile] = useState({ fullname: '', phone: '', address: '' });
    const [profileMessage, setProfileMessage] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        if (document.cookie) {
            request.get('/api/auth').then((res) => {
                setDataUser(res.data);
                setProfile({ fullname: res.data.fullname || '', phone: res.data.phone ? `0${res.data.phone}` : '', address: res.data.address || '' });
            });
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (document.cookie) {
            request.get('/api/payments').then((res) => setDataPayments(res.data));
        }
    }, []);

    const handleLogOut = () => {
        request.post('/api/logout').then((res) => {});
        setTimeout(() => {
            navigate('/');
        }, 2000);
    };

    const handleProfileSave = async (event) => {
        event.preventDefault();
        setSavingProfile(true);
        setProfileMessage('');
        try {
            const response = await request.put('/api/profile', profile);
            setDataUser(response.data.user);
            setProfile({ fullname: response.data.user.fullname || '', phone: response.data.user.phone ? `0${response.data.user.phone}` : '', address: response.data.user.address || '' });
            setProfileMessage(response.data.message);
        } catch (error) {
            setProfileMessage(error.response?.data?.message || 'Không thể lưu thông tin. Hãy thử lại.');
        } finally {
            setSavingProfile(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <div className={cx('info-user')}>
                    <div className={cx('inner')}>
                        <div className={cx('column-left')}>
                            <img
                                src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
                                alt=""
                            />
                            <div>
                                <ul>
                                    <li id={cx('name')}>{dataUser?.fullname}</li>
                                    <li>
                                        <FontAwesomeIcon id={cx('icons')} icon={faEnvelope} />
                                        {dataUser?.email}
                                    </li>
                                    <li>
                                        <FontAwesomeIcon id={cx('icons')} icon={faLock} />
                                        **********
                                    </li>
                                    <li>
                                        <FontAwesomeIcon id={cx('icons')} icon={faPhone} />0{dataUser?.phone}
                                    </li>
                                    <li>
                                        <FontAwesomeIcon id={cx('icons')} icon={faMoneyCheckDollar} />
                                        {dataUser?.surplus?.toLocaleString()} đ
                                    </li>
                                </ul>
                            </div>
                            <button onClick={handleLogOut} type="button" className="btn btn-danger">
                                Đăng Xuất
                            </button>
                            <form onSubmit={handleProfileSave} style={{ marginTop: 24, maxWidth: 420 }}>
                                <h3>Chỉnh sửa thông tin cá nhân</h3>
                                <label htmlFor="profile-name">Họ và tên</label>
                                <input id="profile-name" className="form-control mb-2" value={profile.fullname} onChange={(e) => setProfile({ ...profile, fullname: e.target.value })} required maxLength={80} />
                                <label htmlFor="profile-phone">Số điện thoại</label>
                                <input id="profile-phone" className="form-control mb-2" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} inputMode="numeric" />
                                <label htmlFor="profile-address">Địa chỉ</label>
                                <textarea id="profile-address" className="form-control mb-2" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} maxLength={250} />
                                <button className="btn btn-primary" type="submit" disabled={savingProfile}>{savingProfile ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
                                {profileMessage && <p role="status" style={{ marginTop: 10 }}>{profileMessage}</p>}
                            </form>
                        </div>

                        <div style={{ overflowX: 'auto' }} className="table-responsive">
                            <h2>Hoạt Động Gần Đây</h2>
                            <table
                                style={{ marginTop: '20px', minWidth: '800px' }}
                                className="table table-bordered border-primary"
                            >
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Email Người Dùng</th>
                                        <th scope="col">Tên Sản Phẩm</th>
                                        <th scope="col">Size</th>
                                        <th scope="col">Số Lượng</th>
                                        <th scope="col">Tổng Tiền</th>
                                        <th scope="col">Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataPayments.map((item) => (
                                        <>
                                            {item.products.map((item2, index) => (
                                                <tr key={item._id || 12}>
                                                    {index === 0 && (
                                                        <>
                                                            <td
                                                                style={{
                                                                    overflow: 'hidden',
                                                                }}
                                                                rowSpan={item.products.length}
                                                            >
                                                                {item._id.slice(0, 7)}
                                                            </td>
                                                            <td rowSpan={item.products.length}>{item.user}</td>
                                                        </>
                                                    )}
                                                    <td>{item2.nameProduct}</td>
                                                    <td>{item2.size}</td>
                                                    <td>{item2.quantity}</td>
                                                    {index === 0 && (
                                                        <>
                                                            <td rowSpan={item.products.length}>
                                                                {item.sumprice.toLocaleString()} đ
                                                            </td>
                                                            <td rowSpan={item.products.length}>
                                                                {item.tinhtrang
                                                                    ? 'Đã Giao Thành Công'
                                                                    : 'Người Bán Đang Chuẩn Bị Hàng'}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>
                            </table>
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

export default InfoUser;

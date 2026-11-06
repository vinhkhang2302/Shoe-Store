import classNames from 'classnames/bind';
import styles from '../Styles/Footer.module.scss';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Footer() {
    const navigate = useNavigate();

    return (
        <div className={cx('wrapper')}>
            <main>
                <div className={cx('inner')}>
                    <div className={cx('box-item')}>
                        <ul>
                            <li id={cx('item-title')}>KAINIE SHOE STORE</li>
                            <li>Giày thể thao cho mọi ngày</li>
                        </ul>
                    </div>

                    <div className={cx('box-item')}>
                        <ul>
                            <li id={cx('item-title')}>DANH MỤC SẢN PHẨM</li>
                            <li><button type="button" onClick={() => navigate('/category/giay-nam')}>Giày Nam</button></li>
                            <li><button type="button" onClick={() => navigate('/category/giay-nu')}>Giày Nữ</button></li>
                            <li><button type="button" onClick={() => navigate('/category/giay-tre-em')}>Giày Trẻ Em</button></li>
                        </ul>
                    </div>

                    <div className={cx('box-item')}>
                        <ul>
                            <li id={cx('item-title')}>HỖ TRỢ MUA HÀNG</li>
                            <li>Thanh toán khi nhận hàng (COD)</li>
                            <li>Chọn size phù hợp trước khi đặt</li>
                            <li>Chat với Kainie để được hỗ trợ</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Footer;

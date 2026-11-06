import classNames from 'classnames/bind';
import styles from './Slidebar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping, faCartPlus, faChartLine, faRightFromBracket, faUsers } from '@fortawesome/free-solid-svg-icons';
import { requestLogout } from '../../../Config/api';

const cx = classNames.bind(styles);

function SlideBar({ setCheckTypeSlideBar, checkTypeSlideBar }) {
    const handleLogout = async () => {
        try {
            await requestLogout();
        } finally {
            window.location.replace('/login');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <h4>Quản Trị Admin</h4>
            <ul>
                <li onClick={() => setCheckTypeSlideBar(1)} id={cx(checkTypeSlideBar === 1 ? 'active' : '')}>
                    <FontAwesomeIcon icon={faBagShopping} />
                    Quản Lý Sản Phẩm
                </li>

                <li onClick={() => setCheckTypeSlideBar(2)} id={cx(checkTypeSlideBar === 2 ? 'active' : '')}>
                    <FontAwesomeIcon icon={faCartPlus} />
                    Quản Lý Đơn Hàng
                </li>

                <li onClick={() => setCheckTypeSlideBar(3)} id={cx(checkTypeSlideBar === 3 ? 'active' : '')}>
                    <FontAwesomeIcon icon={faUsers} />
                    Quản Lý Người Dùng
                </li>

                <li onClick={() => setCheckTypeSlideBar(4)} id={cx(checkTypeSlideBar === 4 ? 'active' : '')}>
                    <FontAwesomeIcon icon={faChartLine} />
                    Quản Lý Doanh Thu
                </li>
                <li onClick={handleLogout} id={cx('logout')}>
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    Đăng xuất
                </li>
            </ul>
        </div>
    );
}

export default SlideBar;

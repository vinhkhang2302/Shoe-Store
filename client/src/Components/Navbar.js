import classNames from 'classnames/bind';
import styles from '../Styles/Navbar.module.scss';

const cx = classNames.bind(styles);

function Navbar({ props }) {
    return (
        <div className={cx('wrapper')}>
            {props.map((item) => (
                <span key={item._id}>
                    Trang Chủ / {item.type == '1' ? 'Giày Nam' : item.type == '2' ? 'Giày Nữ' : 'Giày Trẻ Em'} /{' '}
                    {item.name}
                </span>
            ))}
        </div>
    );
}

export default Navbar;

import classNames from 'classnames/bind';
import styles from '../Styles/Slider.module.scss';
import banner from '../assests/imgs/banner.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckFast, faRotateLeft, faMoneyBillWave, faHeadset } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const benefits = [
    { title: 'Giao hàng', detail: 'Thông tin phí khi đặt hàng', icon: faTruckFast },
    { title: 'Hỗ trợ đổi trả', detail: 'Liên hệ Kainie để được tư vấn', icon: faRotateLeft },
    { title: 'Thanh toán COD', detail: 'Thanh toán khi nhận hàng', icon: faMoneyBillWave },
    { title: 'Hỗ trợ khách hàng', detail: 'Kainie luôn sẵn sàng hỗ trợ', icon: faHeadset },
];

function Slider() {
    return (
        <section className={cx('wrapper')} aria-label="Giới thiệu cửa hàng Kainie">
            <div className={cx('hero')}>
                <img src={banner} alt="Bộ sưu tập giày thể thao Kainie" fetchPriority="high" />
                <div className={cx('hero-shade')} />
                <div className={cx('hero-copy')}>
                    <span>CHUYỂN ĐỘNG THEO CÁCH CỦA BẠN</span>
                    <h1>Tìm đôi giày đồng hành</h1>
                    <p>Khám phá giày thể thao cho mọi phong cách và mọi ngày năng động.</p>
                </div>
            </div>
            <div className={cx('benefits')}>
                {benefits.map((benefit) => (
                    <div className={cx('benefit')} key={benefit.title}>
                        <FontAwesomeIcon icon={benefit.icon} />
                        <div>
                            <strong>{benefit.title}</strong>
                            <span>{benefit.detail}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Slider;

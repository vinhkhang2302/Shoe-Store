import classNames from 'classnames/bind';
import styles from '../Styles/Slider.module.scss';
import adidasBanner from '../assests/imgs/Adidas.jpg';
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
        <section className={cx('wrapper')} aria-label="Thông tin dịch vụ Kainie">
            <div className={cx('hero')}>
                <img src={adidasBanner} alt="Bộ sưu tập giày Adidas — Kick up the cool" />
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

import classNames from 'classnames/bind';
import styles from '../Styles/FeatureGrid.module.scss';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonRunning, faShoePrints, faChild } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function FeatureGrid({ dataProducts = [] }) {
    const collections = [
        { title: 'Giày Nam', caption: 'Khám phá lựa chọn cho phong cách năng động', path: '/category/giay-nam', type: 1, icon: faPersonRunning },
        { title: 'Giày Nữ', caption: 'Tìm đôi giày hợp với nhịp sống của bạn', path: '/category/giay-nu', type: 2, icon: faShoePrints },
        { title: 'Giày Trẻ Em', caption: 'Êm chân cho từng bước khám phá', path: '/category/giay-tre-em', type: 3, icon: faChild },
    ];

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('heading')}>
                    <span className={cx('eyebrow')}>TÌM ĐÔI GIÀY CỦA BẠN</span>
                    <h2>Khám phá bộ sưu tập Kainie</h2>
                </div>
                <div className={cx('collection-grid')}>
                    {collections.map((collection) => {
                        const product = dataProducts.find((item) => Number(item.type) === collection.type && item.img?.[0]);
                        const image = product?.img?.[0]
                            ? `${process.env.REACT_APP_IMG}/${String(product.img[0]).replace(/^\/+/, '')}`
                            : '';
                        return (
                            <Link className={cx('collection-card')} to={collection.path} key={collection.type}>
                                <div className={cx('image-wrap')}>
                                    <div className={cx('image-placeholder')}>
                                        <FontAwesomeIcon icon={collection.icon} />
                                    </div>
                                    {image && <img src={image} alt={collection.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                                    <span className={cx('collection-overlay')} />
                                    <div className={cx('collection-copy')}>
                                        <span>{collection.caption}</span>
                                        <strong>{collection.title}</strong>
                                        <span className={cx('collection-cta')}>Xem bộ sưu tập <b aria-hidden="true">→</b></span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default FeatureGrid;

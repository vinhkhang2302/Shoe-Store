import classNames from 'classnames/bind';
import styles from '../Styles/CardBody.module.scss';
import ModalDetailProduct from '../utils/Modal/ModalDetailProduct';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function CardBody({ item }) {
    const [show, setShow] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const images = Array.isArray(item?.img) ? item.img : [];

    useEffect(() => {
        setImageIndex(0);
    }, [item?._id]);

    const handleImageError = () => {
        setImageIndex((current) => Math.min(current + 1, images.length));
    };

    const imageUrl =
        imageIndex < images.length
            ? process.env.REACT_APP_IMG + '/' + String(images[imageIndex]).replace(/^\/+/, '')
            : '';

    return (
        <article className={cx('wrapper')}>
            <Link className={cx('image-link')} to={'/product/' + item?._id + '/' + item?.slug}>
                <div className={cx('img')}>
                    {imageUrl ? (
                        <img
                            key={imageUrl}
                            src={imageUrl}
                            alt={item?.name || 'Giày Kainie'}
                            loading="lazy"
                            onError={handleImageError}
                        />
                    ) : (
                        <div className={cx('image-fallback')}>Ảnh sản phẩm đang được cập nhật</div>
                    )}
                    <span className={cx('quick-view-label')}>Xem chi tiết</span>
                </div>
            </Link>

            <Link className={cx('info-link')} to={'/product/' + item?._id + '/' + item?.slug}>
                <div className={cx('info')}>
                    <h2>{item?.name}</h2>
                    <span>{Number(item?.price || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
            </Link>

            <div className={cx('actions')}>
                <button type="button" onClick={() => setShow(true)} aria-label="Xem nhanh sản phẩm">
                    <FontAwesomeIcon icon={faEye} />
                    <span>Xem nhanh</span>
                </button>
                <button type="button" onClick={() => setShow(true)} aria-label="Chọn sản phẩm">
                    <FontAwesomeIcon icon={faCartPlus} />
                    <span>Chọn mua</span>
                </button>
            </div>
            <ModalDetailProduct show={show} setShow={setShow} id={item?._id} />
        </article>
    );
}

export default CardBody;
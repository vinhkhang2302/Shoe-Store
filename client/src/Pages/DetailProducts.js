import classNames from 'classnames/bind';
import styles from '../Styles/DetailProducts.module.scss';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import request from '../Config/api';

import { useEffect, useMemo, useState } from 'react';
import addToCartProduct from '../utils/HandleCart/AddToCart';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../Components/Navbar';

import CardBody from '../Components/CardBody';
import SelectSize from '../utils/SelectSize/SelectSize';
import { getSizesForProductType } from '../utils/sizeOptions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faRulerHorizontal } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

const cx = classNames.bind(styles);

function DetailProducts() {
    const location = useLocation();
    const id = location.pathname.split('/')[2];
    const [dataProduct, setDataProduct] = useState([]);
    const [similarProduct, setSimilarProduct] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectImg, setSelectImg] = useState(0);
    const [failedImages, setFailedImages] = useState([]);
    const [selectSize, setSelectSize] = useState('');
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const { getCart, dataUser, dataCart } = useStore();
    const lengthCart = dataCart?.[0]?.products?.length || 0;

    useEffect(() => {
        let active = true;
        setIsLoading(true);
        setLoadError(false);
        setDataProduct([]);
        setSimilarProduct([]);
        setSelectImg(0);
        setFailedImages([]);
        setSelectSize('');

        request
            .get('/api/product', { params: { id } })
            .then((res) => {
                if (active) setDataProduct(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => {
                if (active) setLoadError(true);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

    useEffect(() => {
        if (!id) return undefined;
        let active = true;
        request
            .get('/api/similarproduct', { params: { productId: id } })
            .then((res) => {
                if (active) setSimilarProduct(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => {
                if (active) setSimilarProduct([]);
            });
        return () => {
            active = false;
        };
    }, [id]);

    const product = dataProduct[0];
    const imageList = Array.isArray(product?.img) ? product.img : [];
    const availableImages = imageList.filter((image) => image && !failedImages.includes(image));
    const selectedImage = availableImages[Math.min(selectImg, Math.max(availableImages.length - 1, 0))];
    const productType = Number(product?.type || 0);
    const sizes = getSizesForProductType(productType);

    const uniqueSimilarProducts = useMemo(() => {
        const seen = new Set();
        return similarProduct.filter((item) => {
            const normalizedName = String(item?.name || '').trim().toLocaleLowerCase();
            const key = String(item?.slug || normalizedName).trim().toLocaleLowerCase();
            if (!item?._id || item._id === product?._id || !key || seen.has(key)) return false;
            if (normalizedName === String(product?.name || '').trim().toLocaleLowerCase()) return false;
            seen.add(key);
            return true;
        }).slice(0, 8);
    }, [similarProduct, product]);

    const handleImageError = (image) => {
        setFailedImages((current) => (current.includes(image) ? current : [...current, image]));
    };

    const moveImage = (direction) => {
        if (availableImages.length < 2) return;
        setSelectImg((current) => (current + direction + availableImages.length) % availableImages.length);
    };

    const handleAddProduct = async () => {
        if (!selectSize) {
            toast.info('Vui lòng chọn kích cỡ giày.');
            return;
        }
        if (!dataUser?._id) {
            toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
            return;
        }
        try {
            const result = await addToCartProduct(product, quantity, selectSize);
            toast.success(result.data.message);
            await getCart();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Chưa thể thêm sản phẩm. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <Header lengthCart={lengthCart} />
                <main className={cx('main', 'status-message')}>Đang tải thông tin sản phẩm…</main>
                <Footer />
            </div>
        );
    }

    if (loadError || !product) {
        return (
            <div className={cx('wrapper')}>
                <Header lengthCart={lengthCart} />
                <main className={cx('main', 'status-message')}>
                    <h2>{loadError ? 'Không tải được sản phẩm' : 'Không tìm thấy sản phẩm'}</h2>
                    <p>Hãy kiểm tra kết nối rồi thử tải lại trang.</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header>
                <Header lengthCart={lengthCart} />
            </header>

            <main className={cx('main')}>
                <Navbar props={dataProduct} />
                <section className={cx('form-product')}>
                    <div className={cx('img-product')}>
                        <div className={cx('img-small')} aria-label="Ảnh sản phẩm">
                            {availableImages.map((image, index) => (
                                <button
                                    type="button"
                                    key={image}
                                    className={cx('thumbnail', { 'thumbnail-active': index === selectImg })}
                                    onClick={() => setSelectImg(index)}
                                    aria-label={'Xem ảnh ' + (index + 1)}
                                >
                                    <img
                                        src={process.env.REACT_APP_IMG + '/' + image}
                                        alt={product.name + ' - ảnh ' + (index + 1)}
                                        onError={() => handleImageError(image)}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className={cx('image-stage')}>
                            {selectedImage ? (
                                <img
                                    className={cx('main-image')}
                                    src={process.env.REACT_APP_IMG + '/' + selectedImage}
                                    alt={product.name}
                                    onError={() => handleImageError(selectedImage)}
                                />
                            ) : (
                                <div className={cx('image-placeholder')}>Ảnh sản phẩm đang được cập nhật</div>
                            )}
                            {availableImages.length > 1 && (
                                <>
                                    <button type="button" onClick={() => moveImage(-1)} className={cx('image-arrow', 'arrow-left')} aria-label="Ảnh trước">
                                        <FontAwesomeIcon icon={faAngleLeft} />
                                    </button>
                                    <button type="button" onClick={() => moveImage(1)} className={cx('image-arrow', 'arrow-right')} aria-label="Ảnh tiếp theo">
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={cx('info-product')}>
                        <div className={cx('title-product')}>
                            <span className={cx('eyebrow')}>KAINIE · GIÀY THỂ THAO</span>
                            <h1>{product.name}</h1>
                            <span className={cx('price')}>{Number(product.price || 0).toLocaleString('vi-VN')} ₫</span>
                        </div>

                        <div className={cx('size-guide')}>
                            <button type="button" onClick={() => setShowSizeGuide((visible) => !visible)}>
                                <FontAwesomeIcon icon={faRulerHorizontal} /> Hướng dẫn chọn size
                            </button>
                            {showSizeGuide && <SelectSize dataProduct={dataProduct} show={showSizeGuide} setShow={setShowSizeGuide} />}
                        </div>

                        <div className={cx('size-picker')}>
                            <div className={cx('size-heading')}>
                                <span>Kích cỡ</span>
                                <span>{selectSize ? 'Đã chọn: ' + selectSize : 'Chọn size của bạn'}</span>
                            </div>
                            <div className={cx('form-size')}>
                                {sizes.map((size) => (
                                    <button
                                        type="button"
                                        key={size}
                                        onClick={() => setSelectSize(size)}
                                        className={cx('size-option', { 'size-selected': selectSize === size })}
                                        aria-pressed={selectSize === size}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={cx('quantity-row')}>
                            <span>Số lượng</span>
                            <div className={cx('form-quantity')}>
                                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Giảm số lượng">−</button>
                                <output>{quantity}</output>
                                <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Tăng số lượng">+</button>
                            </div>
                        </div>

                        <button type="button" className={cx('add-to-cart')} onClick={handleAddProduct}>
                            Thêm vào giỏ hàng
                        </button>

                        <div className={cx('service-list')}>
                            <div><strong>Giao hàng</strong><span>Thông tin phí giao hàng khi xác nhận đơn</span></div>
                            <div><strong>Đổi trả</strong><span>Liên hệ cửa hàng để được hỗ trợ</span></div>
                            <div><strong>Thanh toán</strong><span>Thanh toán khi nhận hàng (COD)</span></div>
                            <div><strong>Hỗ trợ</strong><span>Liên hệ Kainie Shoes Store</span></div>
                        </div>
                    </div>
                </section>

                <section className={cx('description')}>
                    <h2>Thông tin sản phẩm</h2>
                    {product.description ? (
                        <div className={cx('description-content')} dangerouslySetInnerHTML={{ __html: product.description }} />
                    ) : (
                        <p>Thông tin chi tiết của sản phẩm sẽ được cập nhật.</p>
                    )}
                </section>

                {uniqueSimilarProducts.length > 0 && (
                    <section className={cx('similar-section')}>
                        <div className={cx('section-heading')}>
                            <div>
                                <span className={cx('eyebrow')}>CÓ THỂ BẠN SẼ THÍCH</span>
                                <h2>Sản phẩm tương tự</h2>
                            </div>
                        </div>
                        <div className={cx('similar-grid')}>
                            {uniqueSimilarProducts.map((item) => <CardBody key={item._id} item={item} />)}
                        </div>
                    </section>
                )}
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default DetailProducts;

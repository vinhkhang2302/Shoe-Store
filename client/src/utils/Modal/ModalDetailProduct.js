import classNames from 'classnames/bind';
import styles from '../../Styles/ModalDetailProduct.module.scss';
import Modal from 'react-bootstrap/Modal';
import addToCartProduct from '../HandleCart/AddToCart';
import request from '../../Config/api';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useStore } from '../../hooks/useStore';
import { getSizesForProductType } from '../sizeOptions';

const cx = classNames.bind(styles);

function ModalDetailProduct({ id, show, setShow }) {
    const handleClose = () => setShow(false);
    const [quantity, setQuantity] = useState(1);
    const [dataProduct, setDataProduct] = useState([]);
    const [selectSize, setSelectSize] = useState('');
    const { dataUser, getCart } = useStore();

    useEffect(() => {
        if (!id) return;
        setSelectSize('');
        request.get('/api/product', { params: { id } }).then((res) => setDataProduct(res.data));
    }, [id]);

    const handleAddToCart = async (product) => {
        if (!selectSize) return toast.info('Vui lòng chọn kích cỡ giày.');
        if (!dataUser?._id) return toast.error('Vui lòng đăng nhập');
        try {
            await addToCartProduct(product, quantity, selectSize);
            await getCart();
            toast.success('Thêm vào giỏ hàng thành công');
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Chưa thể thêm sản phẩm. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        if (quantity < 1) setQuantity(1);
    }, [quantity]);

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <Modal
                show={show}
                dialogClassName={cx('dialog')}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                scrollable
                onHide={handleClose}
            >
                {dataProduct.map((item) => {
                    const sizes = getSizesForProductType(item.type);
                    return (
                        <Modal.Body key={item._id} className={cx('modal-body')}>
                            <div className={cx('img')}>
                                <img src={`${process.env.REACT_APP_IMG}/${item.img?.[0]}`} alt={item.name} />
                            </div>
                            <div className={cx('content')}>
                                <h2>{item.name}</h2>
                                <span id={cx('price')}>{Number(item.price || 0).toLocaleString('vi-VN')} ₫</span>
                                <div dangerouslySetInnerHTML={{ __html: item?.description || '' }} />
                                <div className={cx('select-size')}>
                                    <span>Kích cỡ: {selectSize || 'Chọn size'}</span>
                                    <div className={cx('form-size')}>
                                        {sizes.map((size) => (
                                            <button
                                                type="button"
                                                key={size}
                                                aria-pressed={selectSize === size}
                                                className={cx('size-button', { 'size-selected': selectSize === size })}
                                                onClick={() => setSelectSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className={cx('btn-add-to-cart')}>
                                    <div className={cx('form-quantity')}>
                                        <button type="button" onClick={() => setQuantity((value) => Math.max(1, Number(value) - 1))}>-</button>
                                        <input
                                            id={cx('quantity')}
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                                        />
                                        <button type="button" onClick={() => setQuantity((value) => Number(value) + 1)}>+</button>
                                    </div>
                                    <div className={cx('btn-add-cart')}>
                                        <button type="button" onClick={() => handleAddToCart(item)}>Thêm vào giỏ hàng</button>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                    );
                })}
            </Modal>
        </div>
    );
}

export default ModalDetailProduct;

import classNames from 'classnames/bind';
import styles from '../../Styles/ModalDetailProduct.module.scss';
import Modal from 'react-bootstrap/Modal';
import addToCartProduct from '../HandleCart/AddToCart';
import request from '../../Config/api';

import { useState, useEffect } from 'react';

import { toast, ToastContainer } from 'react-toastify';
import { useStore } from '../../hooks/useStore';
const cx = classNames.bind(styles);

function ModalDetailProduct({ id, show, setShow }) {
    const handleClose = () => setShow(false);
    const [quantity, setQuantity] = useState(1);
    const [dataProduct, setDataProduct] = useState([]);
    const [selectSize, setSelectSize] = useState('');
    const [checkType, setCheckType] = useState(0);

    const { dataUser , getCart } = useStore();

    useEffect(() => {
        dataProduct.map((item) =>
            item.type === 1 ? setCheckType(1) : item.type === 2 ? setCheckType(2) : setCheckType(3),
        );
    }, [dataProduct]);
    useEffect(() => {
        if (!id) {
            return;
        }
        request
            .get('/api/product', {
                params: { id },
            })
            .then((res) => setDataProduct(res.data));
        dataProduct.map((item) => (document.title = `${item.name} - Shoe Store`));
    }, [id]);

    const handleAddToCart = async (props) => {
        if (!dataUser?._id) {
            return toast.error('Vui lòng đăng nhập');
        }
        try {
            await addToCartProduct(props, quantity, selectSize);
            await getCart();
            toast.success('Thêm vào giỏ hàng thành công');
        } catch (error) {
            toast.error('Vui lòng đăng nhập');
        }
    };

    useEffect(() => {
        if (quantity < 1) {
            setQuantity(1);
        }
    }, [quantity]);

    return (
        <div className={cx('wrapper')}>
            <Modal show={show} size="lg" aria-labelledby="contained-modal-title-vcenter" centered onHide={handleClose}>
                {dataProduct.map((item) => (
                    <Modal.Body key={item.id} className={cx('modal-body')}>
                        <div className={cx('img')}>
                            <img src={`${process.env.REACT_APP_IMG}/${item.img[0]}`} alt="" />
                        </div>

                        <div className={cx('content')}>
                            <h2>{item.name}</h2>
                            <span id={cx('price')}>{item.price.toLocaleString()} đ</span>
                            <div dangerouslySetInnerHTML={{ __html: item?.description }} />
                            <div />
                            <div className={cx('select-size')}>
                                {checkType === 1 ? (
                                    <div className={cx('select-size')}>
                                        <span>Kích Cỡ : {selectSize}</span>
                                        <div className={cx('form-size')}>
                                            <div
                                                onClick={() => setSelectSize('39')}
                                                className={cx(selectSize === '39' ? 'active' : '')}
                                            >
                                                <button>39</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('40')}
                                                className={cx(selectSize === '40' ? 'active' : '')}
                                            >
                                                <button>40</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('41')}
                                                className={cx(selectSize === '41' ? 'active' : '')}
                                            >
                                                <button>41</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('42')}
                                                className={cx(selectSize === '42' ? 'active' : '')}
                                            >
                                                <button>42</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('43')}
                                                className={cx(selectSize === '43' ? 'active' : '')}
                                            >
                                                <button>43</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('44')}
                                                className={cx(selectSize === '44' ? 'active' : '')}
                                            >
                                                <button>44</button>
                                            </div>

                                            <div
                                                onClick={() => setSelectSize('45')}
                                                className={cx(selectSize === '45' ? 'active' : '')}
                                            >
                                                <button>45</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : checkType === 2 ? (
                                    <div className={cx('select-size')}>
                                        <span>Kích Cỡ : {selectSize}</span>
                                        <div className={cx('form-size')}>
                                            <div
                                                onClick={() => setSelectSize('35')}
                                                className={cx(selectSize === '35' ? 'active' : '')}
                                            >
                                                <button>35</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('36')}
                                                className={cx(selectSize === '36' ? 'active' : '')}
                                            >
                                                <button>36</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('37')}
                                                className={cx(selectSize === '37' ? 'active' : '')}
                                            >
                                                <button>37</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('38')}
                                                className={cx(selectSize === '38' ? 'active' : '')}
                                            >
                                                <button>38</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('39')}
                                                className={cx(selectSize === '39' ? 'active' : '')}
                                            >
                                                <button>39</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={cx('select-size')}>
                                        <span>Kích Cỡ : {selectSize}</span>
                                        <div className={cx('form-size')}>
                                            <div
                                                onClick={() => setSelectSize('34')}
                                                className={cx(selectSize === '34' ? 'active' : '')}
                                            >
                                                <button>34</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('35')}
                                                className={cx(selectSize === '35' ? 'active' : '')}
                                            >
                                                <button>35</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('36')}
                                                className={cx(selectSize === '36' ? 'active' : '')}
                                            >
                                                <button>36</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('37')}
                                                className={cx(selectSize === '37' ? 'active' : '')}
                                            >
                                                <button>37</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('38')}
                                                className={cx(selectSize === '38' ? 'active' : '')}
                                            >
                                                <button>38</button>
                                            </div>
                                            <div
                                                onClick={() => setSelectSize('39')}
                                                className={cx(selectSize === '39' ? 'active' : '')}
                                            >
                                                <button>39</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={cx('btn-add-to-cart')}>
                                <div className={cx('form-quantity')}>
                                    <button onClick={() => setQuantity(quantity - 1)}>-</button>
                                    <input
                                        id={cx('quantity')}
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                </div>
                                <div className={cx('btn-add-cart')}>
                                    <button onClick={() => handleAddToCart(item)}>Thêm Vào Giỏ Hàng</button>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                ))}
            </Modal>
        </div>
    );
}

export default ModalDetailProduct;

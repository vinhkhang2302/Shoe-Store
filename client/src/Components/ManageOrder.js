import classNames from 'classnames/bind';
import styles from '../Styles/ManageOrder.module.scss';
import Pagination from './Pagination';

import { useEffect, useState } from 'react';
import request from '../Config/api';
import ModalEditOrder from '../utils/Modal/ModalEditOrder';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalCancelOrder from '../utils/Modal/CancelOrder';

const cx = classNames.bind(styles);

function ManageOrder() {
    const [dataCart, setDataCart] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [idPro, setIdPro] = useState(0);
    const [address, setAddress] = useState('');
    const [showModalCancelOrder, setShowModalCancelOrder] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const cartResponse = await request.get('api/getallorder');
            setDataCart(cartResponse.data);
        };

        fetchData();
    }, [showModal, showModalCancelOrder]);

    const [page, setPage] = useState(1);
    const productsPerPage = 5;
    const startIndex = (page - 1) * productsPerPage;
    const totalPages = Math.ceil(dataCart.length / productsPerPage);
    const currentProducts = dataCart.slice(startIndex, startIndex + productsPerPage);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleShowModalEdit = (id, address1) => {
        setShowModal(!showModal);
        setIdPro(id);
        setAddress(address1);
    };

    const handleShowModalCancelOrder = (item) => {
        setSelectedProduct(item);
        setShowModalCancelOrder(true);
    };

    return (
        <div className={cx('manage-product')}>
            <ToastContainer />
            <h2 style={{ fontSize: '25px', marginBottom: '20px' }}>Quản Lý Đơn Hàng</h2>
            <div className="table-responsive">
                <table className="table table-bordered border-primary">
                    <thead style={{ border: 'inherit' }} className="table-light">
                        <tr>
                            <th scope="col">Người Dùng</th>
                            <th scope="col">Số Điện Thoại</th>
                            <th scope="col">Địa Chỉ</th>
                            <th scope="col">Tên Đơn Hàng</th>
                            <th scope="col">Size</th>
                            <th scope="col">Số Lượng</th>
                            <th scope="col">Tổng Giá Tiền</th>
                            <th scope="col">Tình Trạng</th>
                            <th scope="col">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.map((item) =>
                            item.products.map((item2, index) => (
                                <tr key={item2._id}>
                                    {index === 0 && (
                                        <>
                                            <td rowSpan={item.products.length}>{item.username}</td>
                                            <td rowSpan={item.products.length}>{`0${item.phone}`}</td>
                                            <td rowSpan={item.products.length}>{item.address}</td>
                                        </>
                                    )}
                                    <td>{item2.nameProduct}</td>
                                    <td>{item2.size || 'N/A'}</td>
                                    <td>{item2.quantity}</td>
                                    {index === 0 && (
                                        <>
                                            <td rowSpan={item.products.length}>{item.sumprice.toLocaleString()} đ</td>
                                            <td rowSpan={item.products.length}>
                                                {item.tinhtrang ? 'Đã Giao Thành Công' : 'Chuẩn Bị Hàng'}
                                            </td>
                                            <td rowSpan={item.products.length}>
                                                <button
                                                    onClick={() => handleShowModalEdit(item._id)}
                                                    className="btn btn-primary"
                                                    style={{ marginRight: '10px' }}
                                                >
                                                    Xác Nhận
                                                </button>
                                                <button
                                                    onClick={() => handleShowModalCancelOrder(item._id)}
                                                    className="btn btn-danger"
                                                >
                                                    Hủy
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            )),
                        )}
                    </tbody>
                </table>
                <div className={cx('pagination')}>
                    <Pagination page={page} totalPages={totalPages} handlePageChange={handlePageChange} />
                </div>
            </div>
            <ModalEditOrder show={showModal} setShow={setShowModal} id={idPro} address={address} />
            <ModalCancelOrder show={showModalCancelOrder} setShow={setShowModalCancelOrder} item={selectedProduct} />
        </div>
    );
}

export default ManageOrder;

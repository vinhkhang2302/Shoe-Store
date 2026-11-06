import classNames from 'classnames/bind';
import styles from '../Styles/Category.module.scss';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import CardBody from '../Components/CardBody';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import request from '../Config/api';
import Pagination from '../Components/Pagination';

const cx = classNames.bind(styles);

function Category() {
    const [dataProducts, setDataProducts] = useState([]);
    const [checkList, setCheckList] = useState(1);
    const [sortOrder, setSortOrder] = useState('1');
    const [page, setPage] = useState(1);
    const [lengthCart] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const location = useLocation();
    const pathName = location.pathname.slice(10);

    useEffect(() => {
        if (pathName === 'giay-nam') {
            setCheckList(1);
        } else if (pathName === 'giay-nu') {
            setCheckList(2);
        } else if (pathName === '') {
            setCheckList('');
        } else {
            setCheckList(3);
        }
        setPage(1);
    }, [pathName]);

    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        setLoadError(false);
        request
            .get('/api/products')
            .then((res) => {
                if (isActive) setDataProducts(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => {
                if (isActive) setLoadError(true);
            })
            .finally(() => {
                if (isActive) setIsLoading(false);
            });
        return () => {
            isActive = false;
        };
    }, []);

    const filteredProducts = useMemo(
        () => dataProducts.filter((item) => checkList === '' || Number(item.type) === Number(checkList)),
        [dataProducts, checkList],
    );

    const sortedProducts = useMemo(
        () =>
            [...filteredProducts].sort((a, b) =>
                sortOrder === '1' ? Number(a.price) - Number(b.price) : Number(b.price) - Number(a.price),
            ),
        [filteredProducts, sortOrder],
    );

    const productsPerPage = 12;
    const startIndex = (page - 1) * productsPerPage;
    const currentProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const categoryTitle =
        pathName === 'giay-nam' ? 'Giày nam' : pathName === 'giay-nu' ? 'Giày nữ' : pathName === 'giay-tre-em' ? 'Giày trẻ em' : 'Tất cả sản phẩm';

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathName]);

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <header>
                <Header lengthCart={lengthCart} />
            </header>

            <main className={cx('main')}>
                <section className={cx('intro')}>
                    <div>
                        <span className={cx('eyebrow')}>KAINIE · BỘ SƯU TẬP</span>
                        <h1>{categoryTitle}</h1>
                        <p>Chọn đôi giày phù hợp cho từng bước đi của bạn.</p>
                    </div>
                    <span className={cx('result-count')}>{filteredProducts.length} sản phẩm</span>
                </section>

                <section className={cx('toolbar')} aria-label="Lọc sản phẩm">
                    {!(pathName === 'giay-nam' || pathName === 'giay-nu' || pathName === 'giay-tre-em') && (
                        <label className={cx('filter-control')}>
                            <span>Danh mục</span>
                            <select
                                value={checkList}
                                onChange={(e) => {
                                    setCheckList(e.target.value);
                                    setPage(1);
                                }}
                                aria-label="Chọn loại giày"
                            >
                                <option value="">Tất cả giày</option>
                                <option value={1}>Giày nam</option>
                                <option value={2}>Giày nữ</option>
                                <option value={3}>Giày trẻ em</option>
                            </select>
                        </label>
                    )}
                    <label className={cx('filter-control', 'sort-control')}>
                        <span>Sắp xếp</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            aria-label="Sắp xếp sản phẩm theo giá"
                        >
                            <option value="1">Giá: thấp đến cao</option>
                            <option value="2">Giá: cao đến thấp</option>
                        </select>
                    </label>
                </section>

                {isLoading ? (
                    <div className={cx('message-card')}>Đang tải sản phẩm…</div>
                ) : loadError ? (
                    <div className={cx('message-card')}>
                        <h2>Chưa kết nối được máy chủ</h2>
                        <p>Hãy kiểm tra server đang chạy, sau đó tải lại trang.</p>
                    </div>
                ) : currentProducts.length ? (
                    <div className={cx('card')}>
                        {currentProducts.map((item) => (
                            <CardBody key={item._id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className={cx('message-card')}>
                        <h2>Danh mục này chưa có sản phẩm</h2>
                        <p>Sản phẩm bạn thêm sẽ xuất hiện tại đây.</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className={cx('pagination')}>
                        <Pagination totalPages={totalPages} page={page} handlePageChange={handlePageChange} />
                    </div>
                )}
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Category;
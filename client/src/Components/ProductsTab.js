import classNames from 'classnames/bind';
import styles from '../Styles/ProductsTab.module.scss';
import CardBody from './CardBody';
import { useState } from 'react';

const cx = classNames.bind(styles);
const categories = [
    { id: '1', label: 'Giày Nam' },
    { id: '2', label: 'Giày Nữ' },
    { id: '3', label: 'Giày Trẻ Em' },
];

function ProductsTab({ dataProducts = [], loading = false }) {
    const [activeCategory, setActiveCategory] = useState('1');
    const products = dataProducts
        .filter((item) => Number(item.type) === Number(activeCategory))
        .slice(0, 8);

    return (
        <section className={cx('wrapper')} aria-labelledby="featured-products-title">
            <div className={cx('section-heading')}>
                <div>
                    <span className={cx('eyebrow')}>KAINIE · BỘ SƯU TẬP</span>
                    <h1 id="featured-products-title">Sản phẩm nổi bật</h1>
                </div>
                <div className={cx('list-select')} role="tablist" aria-label="Danh mục sản phẩm nổi bật">
                    {categories.map((category) => (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeCategory === category.id}
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={cx('category-tab', { 'active-list': activeCategory === category.id })}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className={cx('empty-state')}><strong>Đang tải sản phẩm…</strong></div>
            ) : products.length > 0 ? (
                <div className={cx('product-grid')}>
                    {products.map((item) => <CardBody key={item._id} item={item} />)}
                </div>
            ) : (
                <div className={cx('empty-state')}>
                    <strong>Danh mục này đang được cập nhật</strong>
                    <span>Sản phẩm mới sẽ sớm xuất hiện tại Kainie.</span>
                </div>
            )}
        </section>
    );
}

export default ProductsTab;

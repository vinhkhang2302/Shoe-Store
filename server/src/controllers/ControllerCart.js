const modelCart = require('../models/ModelCart');
const modelUser = require('../models/ModelUser');
const { jwtDecode } = require('jwt-decode');

class ControllerCart {
    async AddToCart(req, res) {
        try {
            const token = req.cookies.Token;
            if (!token) {
                return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập lại!' });
            }

            const decoded = jwtDecode(token);
            const { nameProduct, quantityProduct, priceProduct, imgProduct, size, type } = req.body;

            if (!nameProduct || !quantityProduct || !priceProduct || !imgProduct || !size || !type) {
                return res.status(400).json({ message: 'Dữ liệu không đầy đủ!' });
            }

            const dataUser = await modelCart.findOne({ user: decoded.email });
            const dataUser2 = await modelUser.findOne({ email: decoded.email });

            if (dataUser) {
                const updatedCart = await modelCart.findOneAndUpdate(
                    { user: decoded.email },
                    {
                        $push: {
                            products: {
                                nameProduct: nameProduct,
                                quantity: quantityProduct,
                                price: priceProduct,
                                size: size,
                                img: imgProduct,
                                type: type,
                            },
                        },
                        $inc: {
                            sumprice: priceProduct * quantityProduct,
                        },
                        $set: {},
                    },
                    { new: true },
                );

                if (updatedCart) {
                    return res.status(200).json({ message: 'Thêm Vào Giỏ Hàng Thành Công !!!' });
                }
            } else {
                const newCart = new modelCart({
                    products: [
                        {
                            nameProduct: nameProduct,
                            quantity: quantityProduct,
                            price: priceProduct,
                            size: size,
                            img: imgProduct,
                            type: type,
                        },
                    ],
                    sumprice: priceProduct * quantityProduct,
                    user: decoded.email,
                    phone: dataUser2.phone,
                });

                await newCart.save();
                return res.status(200).json({ message: 'Thêm Vào Giỏ Hàng Thành Công !!!' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Có Lỗi Xảy Ra !!!', error: err.message });
        }
    }
    async GetCart(req, res) {
        const token = req.cookies;
        const decoded = jwtDecode(token.Token);
        modelCart.find({ user: decoded.email }).then((dataCart) => {
            return res.status(200).json(dataCart);
        });
    }
    async DeleteCart(req, res) {
        try {
            const token = req.cookies.Token;
            if (!token) {
                return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập lại!' });
            }

            const decoded = jwtDecode(token);
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ message: 'ID sản phẩm không hợp lệ!' });
            }

            const cart = await modelCart.findOne({ user: decoded.email });

            if (cart) {
                const productIndex = cart.products.findIndex((product) => product._id.toString() === id);
                if (productIndex > -1) {
                    const removedProduct = cart.products[productIndex];

                    cart.sumprice -= removedProduct.price * removedProduct.quantity;

                    cart.products.splice(productIndex, 1);

                    await cart.save();

                    return res.status(200).json({ message: 'Xóa Sản Phẩm Thành Công !!!' });
                } else {
                    return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng!' });
                }
            } else {
                return res.status(404).json({ message: 'Không tìm thấy giỏ hàng!' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Có Lỗi Xảy Ra !!!', error: err.message });
        }
    }

    async updateInfoCart(req, res) {
        const { name, phone, address } = req.body;
        if (!name || !phone || !address) {
            return res.status(400).json({ message: 'Dữ liệu không đầy đủ' });
        }

        const token = req.cookies.Token;
        const decoded = jwtDecode(token);
        const dataUser = await modelCart.findOne({ user: decoded.email });
        if (dataUser) {
            const updatedCart = await modelCart.findOneAndUpdate({ user: decoded.email }, { name, phone, address });
            return res.status(200).json({ message: 'Cập nhật thông tin giỏ hàng thành công', updatedCart });
        }
    }
}

module.exports = new ControllerCart();

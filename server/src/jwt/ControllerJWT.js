const jwt = require('jsonwebtoken');

const modelUser = require('../models/ModelUser');

const middlewareController = {
    verifyToken: (req, res, next) => {
        try {
            const token = req.cookies.Token;
            if (!token) {
                return res.status(401).json('Bạn Cần Đăng Nhập Lại !!!');
            }

            if (token) {
                jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                    if (err) {
                        return res.status(403).json('Bạn Cần Đăng Nhập Lại !!!');
                    }
                    req.user = user;
                    next();
                });
            } else {
                res.status(401).json('Bạn Cần Đăng Nhập Lại !!!');
            }
        } catch (error) {
            return res.status(401).json({ message: 'Bạn cần đăng nhập lại' });
        }
    },
    verifyTokenAdmin: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            modelUser.findOne({ email: req.user.email }).select('isAdmin').then((findUser) => {
                if (findUser?.isAdmin === true) return next();
                return res.status(403).json({ message: 'Bạn không có quyền thao tác' });
            }).catch(() => res.status(500).json({ message: 'Không thể xác minh quyền quản trị' }));
        });
    },
};

module.exports = middlewareController;

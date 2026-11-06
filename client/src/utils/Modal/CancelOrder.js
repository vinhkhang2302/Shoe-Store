import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import request from '../../Config/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ModalCancelOrder({ show, setShow, item }) {
    const handleClose = () => setShow(false);

    const handleDeletePro = async () => {
        const res = await request.post('/api/cancelorder', { id: item });

        toast.success(res.data.message);
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Hủy Đơn Hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn Muốn Hủy Đơn Hàng</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleDeletePro}>
                        Hủy Đơn Hàng
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalCancelOrder;

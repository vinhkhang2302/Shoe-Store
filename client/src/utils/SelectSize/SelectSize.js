import Modal from 'react-bootstrap/Modal';

import menSizeGuide from '../../assests/imgs/bang_size_giay_nam.png';
import womenSizeGuide from '../../assests/imgs/bang_size_giay_nu.png';
import kidsSizeGuide from '../../assests/imgs/bang-size-giay-tre-em.png';

const sizeGuides = {
    1: { title: 'Bảng size giày nam', image: menSizeGuide },
    2: { title: 'Bảng size giày nữ', image: womenSizeGuide },
    3: { title: 'Bảng size giày trẻ em', image: kidsSizeGuide },
};

function SelectSize({ dataProduct = [], show, setShow }) {
    const handleClose = () => setShow(false);
    const guide = sizeGuides[Number(dataProduct[0]?.type)] || sizeGuides[3];

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{guide.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <img
                    src={guide.image}
                    alt={guide.title}
                    style={{ display: 'block', width: '100%', maxHeight: '75vh', objectFit: 'contain' }}
                />
            </Modal.Body>
        </Modal>
    );
}

export default SelectSize;

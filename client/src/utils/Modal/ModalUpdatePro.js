import { useState, useRef, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Editor } from '@tinymce/tinymce-react';
import request from '../../Config/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ModalUpdatePro({ show, setShow, data }) {
    const [nameProduct, setNameProduct] = useState('');
    const [priceProduct, setPriceProduct] = useState(0);
    const [description, setDescription] = useState('');
    const handleClose = () => setShow(false);
    const editorRef = useRef(null);

    useEffect(() => {
        setNameProduct(data.name);
        setPriceProduct(data.price);
        setDescription(data.description);
    }, [data]);

    const handleUpdatePro = async () => {
        if (editorRef.current) {
            setDescription(editorRef.current.getContent());
        }

        const res = await request.post('/api/editpro', {
            id: data,
            nameProduct: nameProduct,
            priceProduct: priceProduct,
            description: editorRef.current ? editorRef.current.getContent() : '',
        });
        toast.success(res.data.message);
        setShow(false);
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh Sửa Sản Phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-floating mb-3">
                        <input
                            className="form-control"
                            id="floatingInput"
                            onChange={(e) => setNameProduct(e.target.value)}
                            value={nameProduct}
                        />
                        <label htmlFor="floatingInput">Tên Sản Phẩm</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            className="form-control"
                            id="floatingPassword"
                            value={priceProduct}
                            type="number"
                            onChange={(e) => setPriceProduct(e.target.value)}
                        />
                        <label htmlFor="floatingPassword">Giá Sản Phẩm</label>
                    </div>

                    <div className="form-floating mb-3">
                        <Editor
                            apiKey="n4hxnmi16uwk9dmdgfx6nscsf8oc30528dlcub1mzsk8deqy"
                            onInit={(_evt, editor) => (editorRef.current = editor)}
                            value={description}
                            init={{
                                height: 500,
                                menubar: false,
                                plugins: [
                                    'advlist',
                                    'autolink',
                                    'lists',
                                    'link',
                                    'image',
                                    'charmap',
                                    'preview',
                                    'anchor',
                                    'searchreplace',
                                    'visualblocks',
                                    'code',
                                    'fullscreen',
                                    'insertdatetime',
                                    'media',
                                    'table',
                                    'code',
                                    'help',
                                    'wordcount',
                                ],
                                toolbar:
                                    'undo redo | blocks | bold italic forecolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | help',
                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                            }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleUpdatePro}>
                        Lưu Lại
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalUpdatePro;

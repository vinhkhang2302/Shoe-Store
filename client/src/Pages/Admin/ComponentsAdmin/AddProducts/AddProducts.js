import className from 'classnames/bind';
import styles from './AddProducts.module.scss';
import { useState, useRef } from 'react';
import request from '../../../../Config/api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Editor } from '@tinymce/tinymce-react';

const cx = className.bind(styles);

function AddProducts({ setCheckOpenAddProduct }) {
    const [nameProduct, setNameProduct] = useState('');
    const [priceProduct, setPriceProduct] = useState(0);
    const [description, setDescription] = useState('');
    const [fileImg, setFileImg] = useState([]);
    const [checkType, setCheckType] = useState(0);
    // const [dataProduct, setDataProduct] = useState([]);

    const handleFileChange = (e) => {
        const filesArray = Array.from(e.target.files);
        const newImg = filesArray.sort((a, b) => a.name.localeCompare(b.name));

        setFileImg(newImg);
    };

    // const fetchData = async () => {
    //     try {
    //         const productsResponse = await request.get('/api/products');
    //         setDataProduct(productsResponse.data);
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //     }
    // };

    const editorRef = useRef(null);

    const handleEditorChange = () => {
        if (editorRef.current) {
            setDescription(editorRef.current.getContent());
        }
    };

    const handleAddProduct = async () => {
        const formData = new FormData();
        formData.append('nameProduct', nameProduct);
        formData.append('priceProduct', priceProduct);
        formData.append('description', description);
        formData.append('checkType', checkType);
        fileImg.forEach((file) => {
            formData.append('fileImg', file);
        });

        try {
            const response = await request.post('/api/addproduct', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(response.data.message);
            // fetchData();
            clearForm();
        } catch (error) {
            console.error('Error uploading product:', error);
            toast.error('Error uploading product');
        }
    };

    const clearForm = () => {
        setNameProduct('');
        setPriceProduct(0);
        setDescription('');
        setCheckType(0);
        setFileImg([]);
    };

    return (
        <div className={cx('wrapper')}>
            <ToastContainer />
            <div className={cx('title')}>
                <h1>Đăng Sản Phẩm</h1>
                <button onClick={() => setCheckOpenAddProduct(false)} type="button" className="btn btn-primary">
                    Quay Lại
                </button>
            </div>
            <div className="form-floating mb-3">
                <input
                    type="text"
                    className="form-control"
                    id="floatingInput"
                    value={nameProduct}
                    onChange={(e) => setNameProduct(e.target.value)}
                />
                <label htmlFor="floatingInput">Tên Sản Phẩm</label>
            </div>
            <div className="form-floating">
                <input
                    type="number"
                    className="form-control"
                    id="floatingPassword"
                    value={priceProduct}
                    onChange={(e) => setPriceProduct(e.target.value)}
                />
                <label htmlFor="floatingPassword">Giá Sản Phẩm</label>
            </div>
            <select
                className="form-select"
                aria-label="Default select example"
                value={checkType}
                onChange={(e) => setCheckType(e.target.value)}
            >
                <option value="0">Chọn Loại Giày</option>
                <option value="1">Giày Nam</option>
                <option value="2">Giày Nữ</option>
                <option value="3">Giày Trẻ Em</option>
            </select>

            <Editor
                apiKey="n4hxnmi16uwk9dmdgfx6nscsf8oc30528dlcub1mzsk8deqy"
                onInit={(evt, editor) => (editorRef.current = editor)}
                initialValue={description}
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
                        'undo redo | formatselect | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                }}
                onChange={handleEditorChange}
            />

            <div className={cx('form-upload-image')}>
                <div style={{ height: '25px' }}>
                    <FontAwesomeIcon id={cx('icon-animation')} icon={faAngleDown} />
                </div>
                <label htmlFor="file-upload">Ảnh Sản Phẩm</label>
                <input id="file-upload" type="file" name="fileImg" multiple onChange={handleFileChange} />
                <div className={cx('image-container')}>
                    {fileImg.map((file, index) => (
                        <div key={index} className={cx('image-upload')}>
                            <img src={URL.createObjectURL(file)} alt="" />
                        </div>
                    ))}
                </div>
            </div>

            <div className={cx('btn-submit')}>
                <button onClick={handleAddProduct}>Thêm Sản Phẩm</button>
            </div>
        </div>
    );
}

export default AddProducts;

import { useEffect, useState } from 'react';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FeatureGrid from './Components/FeatureGrid';
import Footer from './Components/Footer';
import Header from './Components/Header';
import ProductsTab from './Components/ProductsTab';
import Slider from './Components/Slider';
import request from './Config/api';
import Chatbot from './utils/Chatbot/Chatbot';

function App() {
    const [dataProducts, setDataProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        let active = true;
        request
            .get('/api/products')
            .then((res) => {
                if (active) setDataProducts(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => {
                if (active) setDataProducts([]);
            })
            .finally(() => {
                if (active) setProductsLoading(false);
            });

        return () => { active = false; };
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="App">
            <ToastContainer />
            <header>
                <Header />
            </header>
            <main>
                <Chatbot />
                <Slider />
                <ProductsTab dataProducts={dataProducts} loading={productsLoading} />
                <FeatureGrid dataProducts={dataProducts} />
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;

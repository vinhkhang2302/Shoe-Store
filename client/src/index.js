import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { publicRoute } from './Route';
import { Provider } from './store/Provider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider>
            <Router>
                <Routes>
                    {publicRoute.map((route, index) => {
                        return <Route key={index} path={route.path} element={route.element} />;
                    })}
                </Routes>
            </Router>
        </Provider>
    </React.StrictMode>,
);

reportWebVitals();

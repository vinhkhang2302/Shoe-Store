import Context from './Context';
import { useEffect, useState } from 'react';

import cookies from 'js-cookie';

import { requestAuth, requestGetCart } from '../Config/api';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [dataCart, setDataCart] = useState([]);
    const [authReady, setAuthReady] = useState(false);

    const getAuthUser = async () => {
        try {
            const res = await requestAuth();
            setDataUser(res);
        } catch (error) {
            setDataUser({});
        } finally {
            setAuthReady(true);
        }
    };

    const getCart = async () => {
        try {
            const res = await requestGetCart();
            const cart = Array.isArray(res) ? res : [];
            setDataCart(cart);
            return cart;
        } catch (error) {
            setDataCart([]);
            return [];
        }
    };

    useEffect(() => {
        const token = cookies.get('logged');

        if (token === '1') {
            getAuthUser();
            getCart();
        } else {
            setAuthReady(true);
        }
    }, []);

    return <Context.Provider value={{ dataUser, dataCart, getCart, authReady }}>{children}</Context.Provider>;
}

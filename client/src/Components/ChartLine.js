import classNames from 'classnames/bind';
import styles from '../Styles/ChartLine.module.scss';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import { useEffect, useState } from 'react';
import request from '../Config/api';

const cx = classNames.bind(styles);

function ChartLine() {
    const [dataOrder, setDataOrder] = useState([]);
    const [dataPrice, setDataPrice] = useState(0);
    const [dataPrice2, setDataPrice2] = useState(0);
    const [dataPrice3, setDataPrice3] = useState(0);

    useEffect(() => {
        request.get('/api/dataorderuser').then((res) => {
            if (res?.data) {
                setDataOrder(res.data);
            }
        });
    }, []);

    useEffect(() => {
        const filterType = dataOrder.map((item) => item.filter((item2) => item2.type === 1));
        const filterType2 = dataOrder.map((item) => item.filter((item2) => item2.type === 2));
        const filterType3 = dataOrder.map((item) => item.filter((item2) => item2.type === 3));

        const sumPrice1 = filterType
            .map((item) => item.reduce((total, item2) => total + item2.price * item2.quantity, 0))
            .reduce((total, item) => total + item, 0);
        setDataPrice(sumPrice1);
        const sumPrice2 = filterType2
            .map((item) => item.reduce((total, item2) => item2.price * item2.quantity, 0))
            .reduce((total, item) => total + item, 0);
        setDataPrice2(sumPrice2);
        const sumPrice3 = filterType3
            .map((item) => item.reduce((total, item2) => item2.price * item2.quantity, 0))
            .reduce((total, item) => total + item, 0);
        setDataPrice3(sumPrice3);
    }, [dataOrder]);

    ChartJS.register(ArcElement, Tooltip, Legend);

    const data = {
        labels: ['Giày Nam', 'Giày Nữ', 'Giày trẻ em'],
        datasets: [
            {
                label: 'Doanh Thu Đã Bán',
                data: [dataPrice, dataPrice2, dataPrice3],
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    return (
        <div>
            <h4>Quản Lý Doanh Thu</h4>

            <div className={cx('chart')}>
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}

export default ChartLine;

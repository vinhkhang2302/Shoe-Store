import { Navigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

function CheckingAccess() {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Đang xác minh quyền truy cập...</main>;
}

export function CustomerOnly({ children }) {
    const { dataUser, authReady } = useStore();

    if (!authReady) return <CheckingAccess />;
    if (dataUser?.isAdmin) return <Navigate to="/admin" replace />;

    return children;
}

export function AdminOnly({ children }) {
    const { dataUser, authReady } = useStore();

    if (!authReady) return <CheckingAccess />;
    if (!dataUser?.isAdmin) return <Navigate to={dataUser?._id ? '/' : '/login'} replace />;

    return children;
}

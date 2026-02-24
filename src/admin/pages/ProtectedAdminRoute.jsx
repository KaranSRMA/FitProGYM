import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

export const ProtectedAdminRoute = ({ children }) => {
    const { loggedIn, role, is_active } = useSelector((state) => state.auth || {});


    if (!is_active){
        <div className='text-white bg-black text-center text-xl'>User is not active, redirecting...</div>; 
        setTimeout(() => {
            <Navigate to='/login' replace />
        }, 2000);
    }
    
    if (!loggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};


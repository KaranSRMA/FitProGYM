import { useEffect } from 'react'
import './App.css'
import { Outlet, useLocation } from "react-router";
import { NavigationBar } from './components/NavigationBar';
import { useDispatch, useSelector } from 'react-redux';
import { verifyAuth } from './components/dashboard/authSlice';
import { AdminNavigation } from './admin/pages/AdminNavigation';

function App() {
  const { pathname } = useLocation();
  const { loggedIn, role, is_active } = useSelector(state => state.auth || {})
  const showAdminNav = loggedIn && is_active && role === 'admin';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(verifyAuth());
  }, []);


  return (
    <div>
      {showAdminNav ? <AdminNavigation /> : <NavigationBar />}
      <Outlet />
    </div>
  )
}

export default App

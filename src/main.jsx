import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TrainersPage from './pages/TrainersPage.jsx';
import MembershipsPage from './pages/MembershipsPage.jsx';
import LoginPage from './pages/LoginPage.jsx'
import { SignUpPage } from './pages/SignUpPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { store } from './components/dashboard/store.js';
import { Provider } from 'react-redux';
import { AdminLayout } from './admin/AdminLayout.jsx';
import { AdminDashboard } from './admin/pages/AdminDashboard.jsx';
import { MembersManagement } from './admin/pages/MembersManagement.jsx';
import { TrainersManagement } from './admin/pages/TrainersManagement.jsx';
import { MembershipPlansManagement } from './admin/pages/MembershipsPlansManager.jsx';
import { NotificationsManagement } from './admin/pages/NotificationsManagement.jsx';
import { CheckInManagement } from './admin/pages/CheckInManagement.jsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();


const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: HomePage },
      { path: "dashboard", Component: DashboardPage },
      { path: "trainers", Component: TrainersPage },
      { path: "memberships", Component: MembershipsPage },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: SignUpPage },
      {
        path: "admin", Component: AdminLayout,
        children: [
          { path: "dashboard", Component: AdminDashboard },
          { path: "members", Component: MembersManagement },
          { path: "trainers", Component: TrainersManagement },
          { path: "plans", Component: MembershipPlansManagement },
          { path: "notifications", Component: NotificationsManagement },
          { path: "checkins", Component: CheckInManagement },
        ]
      },
      { path: "*", Component: NotFoundPage }
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <Toaster richColors toastOptions={{ duration: 7000 }} />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </Provider>
)

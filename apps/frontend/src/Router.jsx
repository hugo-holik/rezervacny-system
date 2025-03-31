import { createBrowserRouter } from 'react-router-dom';
import MinimalLayout from './components/layout/MinimalLayout';
import Protected from './components/layout/Protected';
import { RouteNotFound } from './components/RouteNotFound.component';
import Exercises from './pages/admin/Exercises';
import authRoutes from './pages/auth';
import Dashboard from './pages/dashboard/Dashboard';

import adminRoutes from '@app/pages/admin';

export const router = createBrowserRouter([
  {
    element: <MinimalLayout />,
    children: [
      {
        path: 'auth',
        children: authRoutes
      }
    ]
  },
  {
    element: <Protected />,
    children: [
      {
        path: '/',
        element: <Exercises /> // Default route to Exercises page
      },
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: 'admin',
        children: adminRoutes
      },
      {
        path: '*',
        element: <RouteNotFound />
      }
    ]
  },
  {
    path: '*',
    element: <RouteNotFound />
  }
]);

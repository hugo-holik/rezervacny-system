import { createBrowserRouter } from 'react-router-dom';
import MinimalLayout from './components/layout/MinimalLayout';
import Protected from './components/layout/Protected';
import { RouteNotFound } from './components/RouteNotFound.component';
import Info from './pages/admin/Info';
import authRoutes from './pages/auth';
import Dashboard from './pages/dashboard/Dashboard';
import EventDetail from './pages/admin/EventDetail';

import adminRoutes from '@app/pages/admin';
import { element } from 'prop-types';

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
        element: <Info /> // Default route to Exercises page
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
      },
      {
        path: 'events/:id',
        element: <EventDetail />
      }
    ]
  },
  {
    path: '*',
    element: <RouteNotFound />
  }
]);

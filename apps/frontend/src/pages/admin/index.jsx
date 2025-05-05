import Aplications from './Applications';
import Calendar from './Calendar';
import Events from './Events';
import Exercises from './Exercises';
import ExternalSchools from './ExternalSchools';
import History from './History';
import Info from './Info';
import MyAccount from './MyAccount';
import UsersList from './UsersList';

const routes = [
  {
    path: 'account',
    element: <MyAccount />
  },
  {
    path: 'users',
    element: <UsersList />
  },
  {
    path: 'external-schools',
    element: <ExternalSchools />
  },
  {
    path: 'exercises',
    element: <Exercises />
  },
  {
    path: 'events',
    element: <Events />
  },
  {
    path: 'calendar',
    element: <Calendar />
  },
  {
    path: 'applications',
    element: <Aplications />
  },
  {
    path: 'history',
    element: <History />
  },
  {
    path: 'info',
    element: <Info />
  }
];

export default routes;

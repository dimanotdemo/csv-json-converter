import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './components/landing-page';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/convert',
    element: <App />,
  },
]); 
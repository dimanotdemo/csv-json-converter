import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './components/landing-page';
import ConvertPage from './pages/convert';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/convert',
    element: <ConvertPage />,
  },
]); 
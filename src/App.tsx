import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import GardenPage from '@/pages/GardenPage';
import TimelinePage from '@/pages/TimelinePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <GardenPage />,
  },
  {
    path: '/timeline',
    element: <TimelinePage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

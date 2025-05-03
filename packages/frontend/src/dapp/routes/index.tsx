import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import IndexPage from '~~/dapp/pages/IndexPage';
import GameDetailPage from '~~/dapp/pages/GameDetailPage';
// Import other pages as needed later

const router = createBrowserRouter([
  {
    path: '/',
    element: <IndexPage />,
    // Optional: Add errorElement for route-level errors
    // errorElement: <ErrorPage />,
  },
  {
    path: '/games/:gameId', // Route for game details
    element: <GameDetailPage />,
    // Optional: Loader function to fetch data before rendering
    // loader: gameDetailLoader,
  },
  // Add other routes here, e.g., for GuideDetailPage
]);

/**
 * Component that provides the configured router to the application.
 */
export function DappRouterProvider() {
  return <RouterProvider router={router} />;
} 
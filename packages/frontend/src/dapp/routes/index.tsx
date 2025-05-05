import { RouteObject, createBrowserRouter } from "react-router-dom";

// import AppLayout from "~~/dapp/components/AppLayout"; // Incorrect path
import AppLayout from "~~/components/layout/AppLayout"; // Corrected path using alias
// import { ErrorPage } from "~~/dapp/pages/ErrorPage"; // Component not found, remove import
import IndexPage from "~~/dapp/pages/IndexPage";
import DashboardPage from "~~/dapp/pages/DashboardPage";
import GameDetailPage from "~~/dapp/pages/GameDetailPage";
import CreateGamePage from "~~/dapp/pages/CreateGamePage";
// import { GuideDetailPage } from "~~/dapp/pages/GuideDetailPage"; // Commented out
import GuideDetailPage from "~~/dapp/pages/GuideDetailPage"; // Uncomment import, assuming default export

const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    // errorElement: <ErrorPage />, // Remove error element for now
    children: [
      {
        index: true,
    element: <IndexPage />,
  },
  {
        path: "dashboard",
    element: <DashboardPage />,
  },
  {
        path: "game/:gameId",
    element: <GameDetailPage />,
  },
  {
        path: "create-game",
    element: <CreateGamePage />,
      },
      // Add the new route for guide details (Commented out for now)
      /*
      {
        path: "guide/:guideId",
        element: <GuideDetailPage />,
      },
      */
      // Uncomment the route for guide details
      {
        path: "guide/:guideId",
        element: <GuideDetailPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes); 
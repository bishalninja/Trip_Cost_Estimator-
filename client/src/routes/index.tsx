import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Estimator from "../pages/Estimator";
import History from "../pages/History";
import Dashboard from "../pages/Dashboard";
import Reports from "../pages/Reports";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Estimator /> },
      { path: "history", element: <History /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "reports", element: <Reports /> },
    ],
  },
]);

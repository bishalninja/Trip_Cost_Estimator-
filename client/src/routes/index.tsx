import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Estimator from "../pages/Estimator";
import History from "../pages/History";
import Dashboard from "../pages/Dashboard";
import Reports from "../pages/Reports";
import RequestForm from "../pages/RequestForm";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Estimator /> },
      { path: "history", element: <History /> },
      { path: "request-form", element: <RequestForm /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "reports", element: <Reports /> },
      
    ],
  },
]);

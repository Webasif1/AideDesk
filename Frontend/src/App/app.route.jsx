import { createBrowserRouter, Outlet } from "react-router-dom";
import ScrollToTop from "../components/ui/ScrollToTop";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import Platform from "../pages/Platform";
import Pricing from "../pages/Pricing";
import Privacy from "../pages/Privacy";
import Solutions from "../pages/Solutions";
import Support from "../pages/Support";
import Integrations from "../pages/Integrations";
import Product from "../pages/Product";
import Demo from "../pages/Demo";
import Docs from "../pages/Docs";

const RootLayout = () => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
);

const AppRoutes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/platform", element: <Platform /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/solutions", element: <Solutions /> },
      { path: "/support", element: <Support /> },
      { path: "/integrations", element: <Integrations /> },
      { path: "/product", element: <Product /> },
      { path: "/demo", element: <Demo /> },
      { path: "/docs", element: <Docs /> },
    ],
  },
]);

export default AppRoutes;

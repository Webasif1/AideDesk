import { createBrowserRouter, Outlet } from "react-router-dom";
import ScrollToTop from "../components/ui/ScrollToTop";
import ProtectedRoute from "../components/ui/ProtectedRoute";
import FloatingThemeToggle from "../components/ui/FloatingThemeToggle";

// Marketing
import Home from "./Pages/Home";
import Platform from "./Pages/Platform";
import Pricing from "./Pages/Pricing";
import Privacy from "./Pages/Privacy";
import Solutions from "./Pages/Solutions";
import Support from "./Pages/Support";
import Integrations from "./Pages/Integrations";
import Product from "./Pages/Product";
import Demo from "./Pages/Demo";
import Docs from "./Pages/Docs";

// Auth
import Login from "../features/auth/Pages/Login";
import Signup from "../features/auth/Pages/Signup";
import ForgotPassword from "../features/auth/Pages/ForgotPassword";
import VerifyEmail from "../features/auth/Pages/VerifyEmail";
import WelcomePage from "../features/auth/Pages/WelcomePage";
import PublicRoute from "../features/auth/components/PublicRoute";

// Company portal (admin)
import CompanyPortal from "../features/company/pages/CompanyPortal";
import CompanyPortalHome from "../features/company/pages/CompanyPortalHome";
import WorkspaceList from "../features/company/pages/WorkspaceList";

// Dashboard / app
import Dashboard from "../features/dashboard/Pages/Dashboard";
import Settings from "../features/settings/Pages/Settings";
import Customers from "../features/user/Pages/Customers";
import Tickets from "../features/ticket/Pages/Tickets";
import Team from "../features/agent/Pages/Team";
import ChatScreen from "../features/chat/Pages/ChatScreen";

// Onboarding
import Onboarding from "../features/onboarding/Pages/Onboarding";
import OnboardingSuccess from "../features/onboarding/Pages/OnboardingSuccess";

const RootLayout = () => (
  <>
    <ScrollToTop />
    <Outlet />
    <FloatingThemeToggle />
  </>
);

const Authenticated = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>{children}</ProtectedRoute>
);

const AppRoutes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public marketing
      {
        path: "/",
        element: (
          <PublicRoute>
            <Home />
          </PublicRoute>
        ),
      },
      {
        path: "/platform",
        element: (
          <PublicRoute>
            <Platform />
          </PublicRoute>
        ),
      },
      { path: "/pricing", element: <Pricing /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/solutions", element: <Solutions /> },
      { path: "/support", element: <Support /> },
      { path: "/integrations", element: <Integrations /> },
      { path: "/product", element: <Product /> },
      {
        path: "/demo",
        element: (
          <PublicRoute>
            <Demo />
          </PublicRoute>
        ),
      },
      { path: "/docs", element: <Docs /> },

      // Public auth
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/verify-email", element: <VerifyEmail /> },

      // Welcome / company setup (admin, post-verification — no companyId yet)
      { path: "/welcome", element: <WelcomePage /> },

      // ── Company Portal (admin only) ──────────────────────────────────
      {
        path: "/company-portal",
        element: (
          <Authenticated roles={["admin"]}>
            <CompanyPortal />
          </Authenticated>
        ),
        children: [
          { index: true, element: <CompanyPortalHome /> },
          { path: "workspaces", element: <WorkspaceList /> },
          {
            path: "settings",
            element: (
              <Authenticated roles={["admin"]}>
                <Settings />
              </Authenticated>
            ),
          },
        ],
      },

      // ── Workspace Dashboard (admin entering workspace, agents, customers) ──
      {
        path: "/dashboard",
        element: (
          <Authenticated roles={["admin", "agent"]}>
            <Dashboard />
          </Authenticated>
        ),
      },
      {
        path: "/dashboard/customers",
        element: (
          <Authenticated roles={["admin", "agent"]}>
            <Customers />
          </Authenticated>
        ),
      },
      {
        path: "/dashboard/tickets",
        element: (
          <Authenticated roles={["admin", "agent", "customer"]}>
            <Tickets />
          </Authenticated>
        ),
      },
      {
        path: "/dashboard/team",
        element: (
          <Authenticated roles={["admin"]}>
            <Team />
          </Authenticated>
        ),
      },
      {
        path: "/dashboard/settings",
        element: (
          <Authenticated roles={["admin"]}>
            <Settings />
          </Authenticated>
        ),
      },
      {
        path: "/dashboard/chat",
        element: (
          <Authenticated roles={["admin", "agent", "customer"]}>
            <ChatScreen />
          </Authenticated>
        ),
      },

      // Onboarding (legacy — kept for backward compat)
      {
        path: "/onboarding",
        element: (
          <Authenticated roles={["admin"]}>
            <Onboarding />
          </Authenticated>
        ),
      },
      {
        path: "/onboarding/success",
        element: (
          <Authenticated roles={["admin"]}>
            <OnboardingSuccess />
          </Authenticated>
        ),
      },
    ],
  },
]);

export default AppRoutes;

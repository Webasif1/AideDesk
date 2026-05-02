import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppRoutes from "./app.route";
import ScrollToTop from "../components/ui/ScrollToTop";
import "./App.css";

const App = () => {
  return (
    <AnimatePresence mode="wait">
      <RouterProvider
        router={AppRoutes}
        future={{ v7_startTransition: true }}
      />
    </AnimatePresence>
  );
};

export default App;

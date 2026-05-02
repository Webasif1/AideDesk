import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppRoutes from "./app.route";
import "./App.css";

const App = () => {
  return (
    <AnimatePresence mode="wait">
      <RouterProvider router={AppRoutes} />
    </AnimatePresence>
  );
};

export default App;

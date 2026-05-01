import { createBrowserRouter } from "react-router-dom";
import Home from "./Pages/Home";

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  }
])


export default AppRoutes

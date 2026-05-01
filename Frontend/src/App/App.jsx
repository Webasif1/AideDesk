import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import AppRoutes from "./app.route";
import "./App.css"
const App = () => {
  return <RouterProvider router={AppRoutes} />
}

export default App

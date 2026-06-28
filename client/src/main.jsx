import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { initSmoothScroll } from "./lib/scroll";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

initSmoothScroll();

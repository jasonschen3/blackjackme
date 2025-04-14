import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Import CSS files

import "./App.css";

import "./styles/header.css";
import "./styles/footer.css";
import "./styles/home.css";
import "./styles/game.css";
import "./styles/login.css";
import "./styles/dashboard.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

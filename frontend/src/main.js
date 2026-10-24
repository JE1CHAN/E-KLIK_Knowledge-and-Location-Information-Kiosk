import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/layout.css";
import "./styles/components.css";

import { h } from "./utils/dom.js";
import { createHeader } from "./components/Header.js";
import { createSidebar } from "./components/Sidebar.js";
import { createHomePage } from "./pages/HomePage.js";
import { startHealthMonitor } from "./services/healthService.js";

const root = document.getElementById("app");

const main = h(
  "main",
  { id: "main-content", class: "app-main", tabindex: "-1" },
  createHomePage(),
);

root.append(createHeader(), createSidebar(), main);

startHealthMonitor();

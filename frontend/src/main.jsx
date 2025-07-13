
// import 'leaflet/dist/leaflet.css';

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ✅ This MUST be here
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { LanguageProvider } from "./i18n";
import "./services/firebase";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // Importa o componente principal App

// Encontra o elemento 'root' no index.html e renderiza o componente App nele
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

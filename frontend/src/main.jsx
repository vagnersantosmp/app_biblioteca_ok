import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // Certifique-se que o caminho e a extensão estão corretos

// Encontra o elemento 'root' no index.html e renderiza o componente App nele
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

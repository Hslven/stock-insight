import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";

import { Particles } from "@/components/magicui/particles";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
        <Particles
          refresh
          className="absolute inset-0 z-0"
          color={"#ffffff"}
          ease={80}
          quantity={100}
          staticity={100}
        />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);

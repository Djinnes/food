import React from "react";
import ReactDOM from "react-dom";
import { GraphQLClient, ClientContext } from "graphql-hooks";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./routes";
import reportWebVitals from "./reportWebVitals";
import LayoutLayer from "./components/Layout";
import "./index.css";

const client = new GraphQLClient({
  url: "http://localhost:4000/graphql",
});

ReactDOM.render(
  <React.StrictMode>
    <ClientContext.Provider value={client}>
      <Router>
        <LayoutLayer>
          <Routes />
        </LayoutLayer>
      </Router>
    </ClientContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();

import { GraphQLClient, ClientContext } from "graphql-hooks";

import Home from "./Home";
import "./App.css";

const client = new GraphQLClient({
  url: "http://localhost:4000/graphql",
});

function App() {
  return (
    <ClientContext.Provider value={client}>
      <Home />
    </ClientContext.Provider>
  );
}

export default App;

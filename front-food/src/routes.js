import { Switch, Route } from "react-router-dom";

import Markets from "./pages/Markets";
import Foods from "./pages/Foods";
import Food from "./pages/Food";

export const routes = [
  {
    title: "Markets",
    key: "markets",
    Component: Markets,
  },
  {
    title: "Foods",
    key: "foods",
    Component: Foods,
  },
];

const Routes = () => (
  <Switch>
    {routes.map(({ key, Component }) => (
      <Route exact path={`/${key}`}>
        <Component />
      </Route>
    ))}
    <Route exact path="/food/:foodId">
      <Food />
    </Route>
  </Switch>
);

export default Routes;

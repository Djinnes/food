import { Route, Routes } from "react-router-dom";

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

const MyRoutes = () => (
  <Routes>
    <Route path="" key={routes[0].key} element={routes[0].Component} />
    {routes.map(({ key, Component }) => (
      <Route path={`/${key}`} key={key} element={<Component />} />
    ))}
    <Route path="/food/:foodId" element={<Food />} />
  </Routes>
);

export default MyRoutes;

import React from "react";
import { useQuery } from "graphql-hooks";
import { Link } from "react-router-dom";
import FOODS_QUERY from "../../queries/foods";

const Foods = () => {
  const { loading, error, data } = useQuery(FOODS_QUERY);
  if (loading) return "Loading...";
  if (error) return "Something Bad Happened";
  return (
    <>
      {data.foods.map(({ id, name }) => (
        <div>
          <Link to={`/food/${id}`}>{name}</Link>
        </div>
      ))}
    </>
  );
};

export default Foods;

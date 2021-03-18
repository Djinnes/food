import React from "react";
import { useQuery } from "graphql-hooks";
import useCurrentPosition from "./hooks/useCurrentPosition";

const HOMEPAGE_QUERY = `query($lat: String!, $long: String!) {
    products(latitude: $lat, longitude: $long) {
      id
      ingredientVariant {
        name
        ingredient {
          name
        }
      }
      brand {
        name
      }
      providers {
        name
        distance
      }
      suppliers {
        name
        distance
      }
    }
  }
  `;

const Home = () => {
  const [currentPosition, err] = useCurrentPosition();
  const { loading, error, data } = useQuery(HOMEPAGE_QUERY, {
    variables: {
      lat: err ? `${currentPosition.coords.latitude}` : "0",
      long: err ? `${currentPosition.coords.longitude}` : "0",
    },
  });
  if (loading) return "Loading...";
  if (error) return "Something Bad Happened";
  const { products } = data;

  return (
    <div>
      {products.map((p) => (
        <div>{p.id}</div>
      ))}
    </div>
  );
};

export default Home;

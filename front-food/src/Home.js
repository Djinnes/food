import React, { useState } from "react";
import { useQuery } from "graphql-hooks";
import { Radio, Tree } from "antd";
import useCurrentPosition from "./hooks/useCurrentPosition";

const INGREDIENT_TYPE_QUERY = `query {
  validIngredientTypes {
    id
    name
  }
  }
  `;

const INGREDIENT_QUERY = `query($lat: String!, $long: String!) {
  ingredientsByDistance(latitude: $lat, longitude: $long) {
      id
      name
      types {
        id
        name
      }
      variants {
        name
      }
    }
    }
    `;

const IngredientTypes = ({ onChange, value }) => {
  const { loading, error, data } = useQuery(INGREDIENT_TYPE_QUERY);
  if (loading) return "Loading...";
  if (error) return "Something Bad Happened";
  const { validIngredientTypes } = data;
  return (
    <Radio.Group value={value} buttonStyle="solid" onChange={onChange}>
      <Radio.Button value="all">All</Radio.Button>
      {validIngredientTypes.map(({ id, name }) => (
        <Radio.Button key={id} value={id}>
          {name}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
};

const Home = () => {
  const [ingredientTypeId, setIngredientTypeId] = useState("all");
  const [currentPosition, err] = useCurrentPosition();
  const { loading, error, data } = useQuery(INGREDIENT_QUERY, {
    variables: {
      lat: err || !currentPosition ? "0" : `${currentPosition.coords.latitude}`,
      long:
        err || !currentPosition ? "0" : `${currentPosition.coords.longitude}`,
    },
  });
  if (loading) return "Loading...";
  if (error) return "Something Bad Happened";
  const { ingredientsByDistance } = data;

  const filteredIngredients =
    ingredientTypeId !== "all"
      ? ingredientsByDistance.filter(({ types }) =>
          types.find(({ id }) => id === ingredientTypeId)
        )
      : ingredientsByDistance;
  const treeData = filteredIngredients.map(({ name, variants }) => ({
    title: name,
    key: name,
    children: variants.map(({ name: variantName }) => ({
      title: variantName,
      key: variantName,
    })),
  }));
  return (
    <div>
      <IngredientTypes
        value={ingredientTypeId}
        onChange={({ target: { value } }) => setIngredientTypeId(value)}
      />

      <Tree treeData={treeData} />
    </div>
  );
};

export default Home;

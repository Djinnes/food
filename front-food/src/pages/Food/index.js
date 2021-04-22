import React, { useState } from "react";
import { useQuery } from "graphql-hooks";
import { useParams } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Line,
  Marker,
} from "react-simple-maps";
import { Row, Col } from "antd";

import FOOD_QUERY from "../../queries/food";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const Food = () => {
  const { foodId } = useParams();
  const [selectedProductId] = useState(0);
  const { loading, error, data } = useQuery(FOOD_QUERY, {
    variables: {
      id: foodId,
    },
  });
  if (loading) return "Loading...";
  if (error) return "Something Bad Happened";
  const markers =
    data.edibleMaterialVariant &&
    data.edibleMaterialVariant.products[selectedProductId]
      ? data.edibleMaterialVariant.products[
          selectedProductId
        ].supplyChainLinks.map(({ chainStep, location: { x, y } }) => ({
          name: chainStep,
          coordinates: [x, y],
        }))
      : [];
  const lineCoordinates =
    data.edibleMaterialVariant &&
    data.edibleMaterialVariant.products[selectedProductId]
      ? data.edibleMaterialVariant.products[
          selectedProductId
        ].supplyChainLinks.map(({ location: { x, y } }) => [x, y])
      : [];

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Row style={{ height: "100%" }}>
        <Col
          span={8}
          style={{
            backgroundColor: "#f5f5f5",
            paddingLeft: 24,
            paddingRight: 24,
            height: "100%",
          }}
        >
          {data.edibleMaterialVariant.products.map(({ id }) => (
            <div>{id}</div>
          ))}
        </Col>
        <Col span={16}>
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 420,
              center: [-40, 30],
            }}
          >
            <Graticule stroke="#DDD" />
            <Geographies
              geography={geoUrl}
              fill="#D6D6DA"
              stroke="#FFFFFF"
              strokeWidth={0.5}
            >
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography key={geo.rsmKey} geography={geo} />
                ))
              }
            </Geographies>
            <Line
              coordinates={lineCoordinates}
              stroke="#FF5533"
              strokeWidth={4}
              strokeLinecap="round"
            />
            {markers.map(({ name, coordinates, markerOffset }) => (
              <Marker key={name} coordinates={coordinates}>
                <g
                  fill="none"
                  stroke="#FF5533"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(-12, -24)"
                >
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                </g>
                <text
                  textAnchor="middle"
                  y={markerOffset}
                  style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
                >
                  {name}
                </text>
              </Marker>
            ))}
          </ComposableMap>
        </Col>
      </Row>
    </div>
  );
};

export default Food;

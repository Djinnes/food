import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "graphql-hooks";
import { Row, Col, Switch } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MARKET_QUERY from "../../queries/markets";
import config from "../../config.json";

const { berlin_location: position } = config;
const requestImageFile = require.context("./images", true, /.jpg$/);

const RowHR = () => (
  <Row>
    <hr style={{ width: "100%", margin: "16px 0" }} />
  </Row>
);

const Markets = () => {
  const [selectedMarket, setSelectedMarket] = useState(null);
  const { loading, error, data } = useQuery(MARKET_QUERY);
  const itemEls = useRef({});
  if (loading) return "Loading...";
  if (error) return "Something Bad Happened";
  const { markets } = data;
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Row style={{ height: "100%" }}>
        <Col
          span={8}
          style={{
            backgroundColor: "#f5f5f5",
            paddingLeft: 24,
            paddingRight: 24,
            overflowY: "scroll",
            height: "100%",
          }}
        >
          <Row style={{ paddingTop: 50 }}>
            <Col span={24}>
              <Row style={{ marginBottom: 8 }}>{markets.length} markets</Row>
              <Row
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                Farmers Markets in Berlin
              </Row>
              <Row
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <div style={{ padding: "5px" }}>
                  <Switch
                    disabled
                    checkedChildren="Local"
                    unCheckedChildren="Not Local"
                    defaultChecked
                  />
                </div>
                <div style={{ padding: "5px" }}>
                  <Switch
                    disabled
                    checkedChildren="Open"
                    unCheckedChildren="Closed"
                    defaultChecked
                  />
                </div>
              </Row>
            </Col>
          </Row>
          <RowHR />
          <Row>Review COVID-19 operating times before you Visit.</Row>
          <RowHR />
          <Row>
            <Col span={24}>
              {markets.map(({ id, name, email }) => (
                <React.Fragment key={id}>
                  <Row
                    onClick={() => setSelectedMarket(id)}
                    style={{
                      border: id === selectedMarket && "2px solid blue",
                    }}
                  >
                    <Col span={10}>
                      <div style={{ width: "100%", height: "100%" }}>
                        <img
                          src={requestImageFile(`./${id}.jpg`)}
                          alt={name}
                          width="100%"
                          height="100%"
                          style={{ borderRadius: "10px" }}
                        />
                      </div>
                    </Col>
                    <Col span={14}>
                      <Row style={{ marginLeft: 16 }}>
                        <Row
                          style={{
                            color: "rgb(113, 113, 113)",
                            fontSize: 14,
                            width: "100%",
                          }}
                        >
                          Neukölln
                        </Row>
                        <Row
                          style={{
                            color: "rgb(34, 34, 34)",
                            fontSize: 18,
                            fontWeight: 400,
                            width: "100%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {name}
                        </Row>
                        <Row style={{ width: "100%" }}>
                          <div
                            style={{
                              margin: "11px 0px",
                              width: 32,
                              borderTop: "1px solid rgb(221, 221, 221)",
                            }}
                          ></div>
                        </Row>
                        <Row>{email}</Row>
                      </Row>
                    </Col>
                  </Row>
                  <RowHR />
                </React.Fragment>
              ))}
            </Col>
          </Row>
        </Col>
        <Col span={16}>
          <div style={{ width: "100%", height: "100%" }}>
            <MapContainer
              center={position}
              zoom={12}
              scrollWheelZoom={false}
              style={{ width: "100%", height: "100%" }}
            >
              <OpenPopup selectedRef={itemEls.current[selectedMarket]} />
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markets.map(({ id, name, location }) => (
                <Marker
                  eventHandlers={{
                    click: () => setSelectedMarket(id),
                  }}
                  key={id}
                  position={[location.y, location.x]}
                  showPopup={id === 1}
                  ref={(element) => (itemEls.current[id] = element)}
                >
                  <Popup>{name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Col>
      </Row>
    </div>
  );
};

const OpenPopup = ({ selectedRef }) => {
  useEffect(() => {
    if (selectedRef) selectedRef.openPopup();
  }, [selectedRef]);
  return null;
};

export default Markets;

import { useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";

import { routes } from "../../routes";

const { Header, Content } = Layout;

const LayoutLayer = ({ children }) => {
  const navigate = useNavigate();
  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["markets"]}
          onSelect={({ key }) => {
            navigate.push(key);
          }}
        >
          {routes.map(({ title, key }) => (
            <Menu.Item key={key}>{title}</Menu.Item>
          ))}
        </Menu>
      </Header>
      <Content style={{ height: "calc(100vh - 64px)" }}>{children}</Content>
    </Layout>
  );
};

export default LayoutLayer;

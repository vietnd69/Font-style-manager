import { useState } from "react";
import { ShowType } from "../widget-src/code";
import { Checkbox, Button, List, Typography, Space } from "antd";

const { Title, Paragraph } = Typography;

const EditShowType = ({ data }: { data: ShowType }) => {
  const [showType, setShowType] = useState<ShowType>(data);

  const handleChange = (key: keyof ShowType) => {
    setShowType((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "setShowEditType",
          data: showType,
        },
      },
      "*"
    );
  };

  const checkboxItems = Object.keys(showType).map((key) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: key,
    checked: showType[key as keyof ShowType],
  }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "16px 16px 0 16px",
      }}
    >
      <div style={{ flex: 1, overflow: "auto" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Typography>
            <Title level={5} style={{ margin: 0 }}>
              Edit Show Type Component
            </Title>
            <Paragraph
              type="secondary"
              style={{ fontSize: "13px", marginBottom: 0 }}
            >
              Select the elements to display in the table if there are too many
              columns. Check the boxes to show elements or uncheck them to hide.
            </Paragraph>
          </Typography>

          <List
            size="small"
            dataSource={checkboxItems}
            style={{ marginTop: 8 }}
            renderItem={(item) => (
              <List.Item style={{ padding: "8px 0" }}>
                <Checkbox
                  checked={item.checked}
                  onChange={() => handleChange(item.value as keyof ShowType)}
                >
                  {item.label}
                </Checkbox>
              </List.Item>
            )}
          />
        </Space>
      </div>

      <div
        style={{
          padding: "16px",
          marginLeft: -16,
          marginRight: -16,
          borderTop: "1px solid #f0f0f0",
          backgroundColor: "#fff",
        }}
      >
        <Button
          type="primary"
          block
          onClick={handleSubmit}
          style={{ height: "32px" }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditShowType;

import { useState } from "react";
import { ShowType } from "../widget-src/code";
import { Checkbox, Button, List, Typography, Space } from "antd";
import "./styles/EditShowType.css";

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
    <div className="edit-show-type">
      <div className="edit-show-type-content auto-hide-scrollbar">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Typography>
            <Title level={5} className="section-title">
              Edit Show Type Component
            </Title>
            <Paragraph type="secondary" className="section-description">
              Select the elements to display in the table if there are too many
              columns. Check the boxes to show elements or uncheck them to hide.
            </Paragraph>
          </Typography>

          <List
            size="small"
            dataSource={checkboxItems}
            className="checkbox-list"
            renderItem={(item) => (
              <List.Item>
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

      <div className="edit-show-type-footer">
        <Button type="primary" block onClick={handleSubmit}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditShowType;

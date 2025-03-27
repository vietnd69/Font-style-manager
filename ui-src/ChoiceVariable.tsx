import React, { useEffect, useState } from "react";
import "./styles/ChoiceVariable.css";
import { Button, Input, List, Typography } from "antd";
import type { CustomVariable } from "../widget-src/code";

const { Title, Paragraph } = Typography;

type ChoiceVariableProps = {
  data: {
    type: string;
    id: string;
    value: string | number;
    variables: CustomVariable[];
  };
};

const formatValue = (value: any, modeId: string | undefined) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value.toString();
  if (
    value &&
    typeof value === "object" &&
    "r" in value &&
    "g" in value &&
    "b" in value &&
    "a" in value
  ) {
    const r = Math.round(value.r * 255);
    const g = Math.round(value.g * 255);
    const b = Math.round(value.b * 255);
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    return value.a !== 1 ? `${hex} | ${Math.round(value.a * 100)}%` : hex;
  }
  return "";
};

const getValueType = (value: any): string => {
  if (value === undefined || value === null) return "unknown";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (value && typeof value === "object") {
    if ("r" in value && "g" in value && "b" in value && "a" in value)
      return "color";
    if (value.type === "VARIABLE_ALIAS") return "variable_reference";
    if (Array.isArray(value)) return "array";
  }
  return "unknown";
};

interface FilterRule {
  type: string;
  scopes: string[];
  valueTypes: string[];
  validate: (value: any) => boolean;
}

const FILTER_RULES: FilterRule[] = [
  {
    type: "fontFamily",
    scopes: ["FONT_FAMILY", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
    valueTypes: ["string"],
    validate: (value) => getValueType(value) === "string",
  },
  {
    type: "fontSize",
    scopes: ["FONT_SIZE", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
    valueTypes: ["number"],
    validate: (value) => getValueType(value) === "number",
  },
  {
    type: "fontWeight",
    scopes: ["FONT_WEIGHT", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
    valueTypes: ["string", "number"],
    validate: (value) => {
      const type = getValueType(value);
      return type === "string" || type === "number";
    },
  },
  {
    type: "fontStyle",
    scopes: ["FONT_STYLE", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
    valueTypes: ["string", "number"],
    validate: (value) => {
      const type = getValueType(value);
      return type === "string" || type === "number";
    },
  },
  {
    type: "lineHeight",
    scopes: ["LINE_HEIGHT", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
    valueTypes: ["number"],
    validate: (value) => getValueType(value) === "number",
  },
  {
    type: "letterSpacing",
    scopes: ["LETTER_SPACING", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
    valueTypes: ["number"],
    validate: (value) => getValueType(value) === "number",
  },
  {
    type: "fill",
    scopes: ["ALL_FILLS"],
    valueTypes: ["color"],
    validate: (value) => getValueType(value) === "color",
  },
  {
    type: "textFill",
    scopes: ["TEXT_FILL", "ALL_FILLS"],
    valueTypes: ["color"],
    validate: (value) => getValueType(value) === "color",
  },
  {
    type: "stroke",
    scopes: ["STROKE_COLOR"],
    valueTypes: ["color"],
    validate: (value) => getValueType(value) === "color",
  },
  {
    type: "strokeWidth",
    scopes: ["STROKE_FLOAT"],
    valueTypes: ["number"],
    validate: (value) => getValueType(value) === "number",
  },
  {
    type: "all",
    scopes: ["ALL_SCOPES"],
    valueTypes: ["any"],
    validate: () => true,
  },
];

const getDefaultValue = (variable: CustomVariable) => {
  if (variable.defaultModeId && variable.valuesByMode[variable.defaultModeId]) {
    return variable.valuesByMode[variable.defaultModeId];
  }
  const firstModeId = Object.keys(variable.valuesByMode)[0];
  return firstModeId ? variable.valuesByMode[firstModeId] : undefined;
};

const hasCompatibleScope = (variable: CustomVariable, scopes: string[]) => {
  return variable.scopes.some(
    (scope) => scopes.includes(scope) || scope === "ALL_SCOPES"
  );
};

const ChoiceVariable: React.FC<ChoiceVariableProps> = ({ data }) => {
  const [variables, setVariables] = useState<CustomVariable[]>([]);
  const [filteredVariables, setFilteredVariables] = useState<CustomVariable[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (data.variables) {
      const rule =
        FILTER_RULES.find((r) => r.type === data.type) ||
        FILTER_RULES.find((r) => r.type === "all");

      if (!rule) {
        setVariables([]);
        setFilteredVariables([]);
        return;
      }

      const filtered = data.variables.filter((variable) => {
        const defaultValue = getDefaultValue(variable);
        return (
          hasCompatibleScope(variable, rule.scopes) &&
          rule.validate(defaultValue)
        );
      });

      setVariables(filtered);
      setFilteredVariables(filtered);
    }
  }, [data]);

  useEffect(() => {
    if (searchTerm && variables.length > 0) {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = variables.filter((variable) =>
        variable.name.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredVariables(filtered);
    } else {
      setFilteredVariables(variables);
    }
  }, [searchTerm, variables]);

  const handleVariableSelect = (variable: CustomVariable) => {
    setSelectedId(variable.id);
    const defaultValue = getDefaultValue(variable);

    // Trường hợp đặc biệt: fontStyle là number thì trả về fontWeight
    let propertyType = data.type;

    // 1. fontStyle là number -> chuyển sang fontWeight
    if (data.type === "fontStyle" && typeof defaultValue === "number") {
      propertyType = "fontWeight";
    }

    // 2. Kiểm tra scope của variable có phù hợp với propertyType không
    const hasValidScope = hasCompatibleScope(
      variable,
      FILTER_RULES.find((r) => r.type === propertyType)?.scopes || []
    );

    if (!hasValidScope) {
      console.error(`Variable không có scope phù hợp với ${propertyType}`);
      // Không tiếp tục nếu scope không phù hợp
      return;
    }

    // 3. Kiểm tra kiểu dữ liệu có phù hợp không
    const valueType = getValueType(defaultValue);
    const expectedTypes =
      FILTER_RULES.find((r) => r.type === propertyType)?.valueTypes || [];

    if (!expectedTypes.includes(valueType) && !expectedTypes.includes("any")) {
      console.error(
        `Variable có kiểu dữ liệu ${valueType} không phù hợp với ${propertyType}`
      );
      // Không tiếp tục nếu kiểu dữ liệu không phù hợp
      return;
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: "setVariable",
          variableId: variable.id,
          styleId: data.id,
          propertyType: propertyType,
        },
      },
      "*"
    );
  };

  if (!data || !Array.isArray(data.variables)) {
    return (
      <div style={{ padding: "16px" }}>
        <Typography>
          <Paragraph type="secondary">No variables available</Paragraph>
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", backgroundColor: "#ffffff" }}>
      <div style={{ marginBottom: "16px" }}>
        <Typography>
          <Title level={5} style={{ margin: 0 }}>
            Choose {data.type === "all" ? "" : data.type} Variable (
            {filteredVariables.length} available)
          </Title>
          <Paragraph
            type="secondary"
            style={{ fontSize: "13px", marginBottom: 8 }}
          >
            Select a variable to bind to this property
          </Paragraph>
        </Typography>

        <Input
          placeholder="Search variables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <List
          size="small"
          dataSource={filteredVariables}
          renderItem={(variable) => {
            const defaultValue = getDefaultValue(variable);

            return (
              <List.Item
                key={variable.id}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  backgroundColor:
                    variable.id === selectedId ? "#e6f4ff" : "#ffffff",
                  borderRadius: "4px",
                  marginBottom: "4px",
                  transition: "all 0.2s ease",
                  border:
                    variable.id === selectedId
                      ? "1px solid #1890ff"
                      : "1px solid transparent",
                }}
                className="variable-item"
                onClick={() => setSelectedId(variable.id)}
                onMouseEnter={(e) => {
                  if (variable.id !== selectedId) {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (variable.id !== selectedId) {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }
                }}
              >
                <span
                  style={{
                    color: variable.id === selectedId ? "#1890ff" : "#000000",
                    fontWeight: variable.id === selectedId ? 500 : 400,
                  }}
                >
                  {variable.name}
                </span>
                <span
                  style={{
                    color: variable.id === selectedId ? "#1890ff" : "#666666",
                    opacity: variable.id === selectedId ? 1 : 0.8,
                    marginLeft: "8px",
                  }}
                >
                  {formatValue(defaultValue, variable.defaultModeId)}
                </span>
              </List.Item>
            );
          }}
          locale={{
            emptyText: searchTerm
              ? `No variables found matching "${searchTerm}"`
              : `No ${data.type === "all" ? "" : data.type} variables found`,
          }}
          style={{
            backgroundColor: "#ffffff",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        />
      </div>

      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            onClick={() =>
              parent.postMessage({ pluginMessage: { type: "close" } }, "*")
            }
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => {
              if (selectedId) {
                const selectedVariable = filteredVariables.find(
                  (v) => v.id === selectedId
                );
                if (selectedVariable) {
                  handleVariableSelect(selectedVariable);
                }
              }
            }}
            disabled={!selectedId}
            style={{ flex: 1 }}
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChoiceVariable;

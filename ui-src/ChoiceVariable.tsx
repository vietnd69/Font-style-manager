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

// Map property types to variable scopes - adding more compatible scopes
const PROPERTY_SCOPE_MAP: { [key: string]: string[] } = {
  fontFamily: ["FONT_FAMILY", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
  fontStyle: ["FONT_STYLE", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
  fontWeight: ["FONT_WEIGHT", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
  fontSize: ["FONT_SIZE", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
  lineHeight: ["LINE_HEIGHT", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
  letterSpacing: ["LETTER_SPACING", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
  paragraphSpacing: ["PARAGRAPH_SPACING", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
  paragraphIndent: ["PARAGRAPH_INDENT", "TEXT", "TYPOGRAPHY", "ALL_SCOPES"],
  fill: ["ALL_FILLS"],
  textFill: ["TEXT_FILL", "ALL_FILLS"],
  shapeFill: ["SHAPE_FILL", "ALL_FILLS"],
  frameFill: ["FRAME_FILL", "ALL_FILLS"],
  stroke: ["STROKE_COLOR"],
  strokeWidth: ["STROKE_FLOAT"],
  effect: ["EFFECT_COLOR"],
  effectFloat: ["EFFECT_FLOAT"],
  cornerRadius: ["CORNER_RADIUS"],
  widthHeight: ["WIDTH_HEIGHT"],
  gap: ["GAP"],
  opacity: ["OPACITY"],
  all: ["ALL_SCOPES"],
};

// Update the PROPERTY_VALUE_TYPE_MAP to support multiple types
const PROPERTY_VALUE_TYPE_MAP: { [key: string]: string[] } = {
  fontFamily: ["string"],
  fontStyle: ["string", "number"], // Accept both string and number for font style
  fontWeight: ["string", "number"], // Accept both string and number for font weight
  fontSize: ["number"],
  lineHeight: ["number"],
  letterSpacing: ["number"],
  paragraphSpacing: ["number"],
  paragraphIndent: ["number"],
  fill: ["color"],
  textFill: ["color"],
  shapeFill: ["color"],
  frameFill: ["color"],
  stroke: ["color"],
  strokeWidth: ["number"],
  effect: ["color"],
  effectFloat: ["number"],
  cornerRadius: ["number"],
  widthHeight: ["number"],
  gap: ["number"],
  opacity: ["number"],
  all: ["any"],
};

console.log("PROPERTY_SCOPE_MAP initialized:", PROPERTY_SCOPE_MAP);

const formatValue = (value: any, defaultModeId: string | undefined) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value.toString();
  // Handle color object
  if (value && typeof value === "object" && "r" in value) {
    const { r, g, b, a = 1 } = value;
    return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
  }
  return "";
};

const getValueType = (value: any): string => {
  console.log("Examining value:", value);
  if (value === undefined || value === null) return "unknown";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (value && typeof value === "object") {
    // Check for color object
    if ("r" in value) return "color";
    // Check for variable reference object
    if ("type" in value && value.type === "VARIABLE_ALIAS") return "variable_reference";
    // Check if it's an array
    if (Array.isArray(value)) return "array";
    console.log("Unknown object type:", value);
  }
  return "unknown";
};

const ChoiceVariable: React.FC<ChoiceVariableProps> = ({ data }) => {
  console.log("ChoiceVariable received data:", data);
  const [variables, setVariables] = useState<CustomVariable[]>([]);
  const [filteredVariables, setFilteredVariables] = useState<CustomVariable[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Variables from data:", data.variables);
    console.log("Required scopes for type:", PROPERTY_SCOPE_MAP[data.type]);
    console.log("Required value types:", PROPERTY_VALUE_TYPE_MAP[data.type]);

    if (data.variables) {
      const compatibleScopes = PROPERTY_SCOPE_MAP[data.type] || ["ALL_SCOPES"];
      const allowedValueTypes = PROPERTY_VALUE_TYPE_MAP[data.type] || ["any"];
      console.log("Filtering variables with compatible scopes:", compatibleScopes);

      const filtered = data.variables.filter((variable) => {
        // Check if the variable has any of the compatible scopes
        const hasCompatibleScope = variable.scopes.some(scope => 
          compatibleScopes.includes(scope) || scope === "ALL_SCOPES"
        );

        // Get default value, handle case where defaultModeId might be missing
        let defaultValue;
        if (variable.defaultModeId && variable.valuesByMode[variable.defaultModeId]) {
          defaultValue = variable.valuesByMode[variable.defaultModeId];
        } else {
          // If defaultModeId is not available, try to get the first value
          const firstModeId = Object.keys(variable.valuesByMode)[0];
          defaultValue = firstModeId ? variable.valuesByMode[firstModeId] : undefined;
        }
        
        console.log(`Variable ${variable.name} default value:`, defaultValue);
        
        const valueType = getValueType(defaultValue);
        
        // For fontStyle and fontWeight, we accept any variable regardless of type
        // since we can't reliably determine the actual type from the API
        const hasCompatibleType = 
          allowedValueTypes.includes("any") || 
          allowedValueTypes.includes(valueType) ||
          (data.type === 'fontStyle' || data.type === 'fontWeight');

        console.log(
          `Variable ${variable.name}:`,
          `scopes: ${variable.scopes.join(", ")},`,
          `value type: ${valueType},`,
          `matches scope: ${hasCompatibleScope},`,
          `matches type: ${hasCompatibleType},`,
          `allowed types: ${allowedValueTypes.join(", ")}`
        );

        return hasCompatibleScope && hasCompatibleType;
      });

      console.log("Filtered variables:", filtered);
      setVariables(filtered);
      setFilteredVariables(filtered);
    }
  }, [data]);

  useEffect(() => {
    if (searchTerm && variables.length > 0) {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = variables.filter(variable => 
        variable.name.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredVariables(filtered);
    } else {
      setFilteredVariables(variables);
    }
  }, [searchTerm, variables]);

  const handleVariableSelect = (variable: CustomVariable) => {
    console.log("Selected variable:", variable);
    setSelectedId(variable.id);
    parent.postMessage(
      {
        pluginMessage: {
          type: "setVariable",
          variableId: variable.id,
          styleId: data.id,
          propertyType: data.type,
        },
      },
      "*"
    );
  };

  if (!data || !Array.isArray(data.variables)) {
    console.log("No valid data or variables array");
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
          renderItem={(variable) => (
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
              onClick={() => handleVariableSelect(variable)}
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
                {formatValue(
                  variable.valuesByMode[variable.defaultModeId || ""],
                  variable.defaultModeId
                )}
              </span>
            </List.Item>
          )}
          locale={{
            emptyText: searchTerm 
              ? `No variables found matching "${searchTerm}"` 
              : `No ${data.type === "all" ? "" : data.type} variables found`,
          }}
          style={{ backgroundColor: "#ffffff", maxHeight: "300px", overflowY: "auto" }}
        />
      </div>

      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
        <Button
          onClick={() =>
            parent.postMessage({ pluginMessage: { type: "close" } }, "*")
          }
          block
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ChoiceVariable;

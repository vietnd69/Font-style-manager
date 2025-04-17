import React, { useEffect, useState } from "react";
import "./styles/ChoiceVariable.css";
import { Button, Input, Typography } from "antd";
import type { CustomVariable } from "../widget-src/code";

const { Title, Paragraph } = Typography;

type ChoiceVariableProps = {
  data: {
    type: string;
    id?: string;
    value?: string | number;
    variables: CustomVariable[];
    moduleName?: string;
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
  const [isForSelectedElements, setIsForSelectedElements] =
    useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem đây có phải là chế độ "choiceVariableSelected" hay không
    // bằng cách xem có id trong data hay không
    setIsForSelectedElements(!data.id);

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
      setLoading(false);
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

    // Xử lý khác nhau cho choiceVariable và choiceVariableSelected
    if (isForSelectedElements) {
      // Trường hợp đặc biệt: nếu là fontFamily, cập nhật checkedFamily thành variable
      if (propertyType === "fontFamily") {
        // Lấy giá trị mặc định của biến
        const defaultValue = getDefaultValue(variable);
        
        parent.postMessage(
          {
            pluginMessage: {
              type: "setFamilyAsVariable",
              variableId: variable.id,
              value: typeof defaultValue === "string" ? defaultValue : "",
            },
          },
          "*"
        );
      } 
      // Trường hợp đặc biệt cho fontStyle
      else if (propertyType === "fontStyle" || propertyType === "fontWeight") {
        // Lấy giá trị mặc định của biến
        const defaultValue = getDefaultValue(variable);
        
        // Nếu là số, có thể đây là fontWeight chứ không phải fontStyle
        if (typeof defaultValue === "number") {
          console.log("Variable has numeric value, might be more suitable for fontWeight:", defaultValue);
        }
        
        // Thêm log để debug
        console.log("Setting fontStyle variable. defaultValue:", defaultValue, "type:", typeof defaultValue);
        
        parent.postMessage(
          {
            pluginMessage: {
              type: "setStyleAsVariable",
              variableId: variable.id,
              value: defaultValue, // Giữ nguyên kiểu dữ liệu gốc, không chuyển đổi
              valueType: typeof defaultValue
            },
          },
          "*"
        );
      }
      // Trường hợp đặc biệt cho fontSize
      else if (propertyType === "fontSize") {
        // Lấy giá trị mặc định của biến
        const defaultValue = getDefaultValue(variable);
        
        parent.postMessage(
          {
            pluginMessage: {
              type: "setFontSizeAsVariable",
              variableId: variable.id,
              value: typeof defaultValue === "number" ? defaultValue.toString() : 
                    typeof defaultValue === "string" ? defaultValue : "",
            },
          },
          "*"
        );
      }
      else {
        // Xử lý cho các property khác
        parent.postMessage(
          {
            pluginMessage: {
              type: "setVariableForSelected",
              variableId: variable.id,
              propertyType: propertyType,
            },
          },
          "*"
        );
      }
    } else {
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
    }
  };

  if (loading) {
    return <div className="choice-variable loading">Đang tải variables...</div>;
  }

  if (!data || !Array.isArray(data.variables)) {
    return (
      <div className="choice-variable">
        <div className="no-variables">
          <Paragraph type="secondary">No variables available</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="choice-variable">
      <div className="search-container">
        <div className="title-container">
          <Title level={5} className="section-title">
            Choose {data.type === "all" ? "" : data.type} Variable (
            {filteredVariables.length} available)
          </Title>
          <Paragraph type="secondary" className="section-description">
            {isForSelectedElements
              ? "Select a variable to apply to selected elements"
              : "Select a variable to bind to this property"}
          </Paragraph>
        </div>

        <Input
          placeholder="Search variables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="variables-list auto-hide-scrollbar">
          {filteredVariables.length > 0 ? (
            filteredVariables.map((variable) => {
              const defaultValue = getDefaultValue(variable);
              const isSelected = variable.id === selectedId;

              return (
                <div
                  key={variable.id}
                  className={`variable-item ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedId(variable.id)}
                >
                  <span className="variable-name">{variable.name}</span>
                  <span className="variable-value">
                    {formatValue(defaultValue, variable.defaultModeId)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="no-variables">
              {searchTerm
                ? `No variables found matching "${searchTerm}"`
                : `No ${data.type === "all" ? "" : data.type} variables found`}
            </div>
          )}
        </div>
      </div>

      <div className="action-container">
        <div className="button-group">
          <Button
            onClick={() =>
              parent.postMessage({ pluginMessage: { type: "close" } }, "*")
            }
            className="cancel-button"
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
            className="select-button"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChoiceVariable;

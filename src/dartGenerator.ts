import { toCamelCase, capitalizeFirstLetter, singularize } from "./utils";

export interface DartClass {
    name: string;
    fields: Map<string, string>;
}

export function generateDartClasses(
    className: string,
    jsonObj: any,
    numberTypes: Map<string, "int" | "double">,
): string {
    const classes: DartClass[] = [];
    const mainClass = parseJsonToClass(className, jsonObj, classes, numberTypes);

    let result = generateClassCode(mainClass);

    // Generate nested classes
    for (const nestedClass of classes) {
        result += "\n\n" + generateClassCode(nestedClass);
    }

    return result;
}

function parseJsonToClass(
    className: string,
    obj: any,
    allClasses: DartClass[],
    numberTypes: Map<string, "int" | "double">,
): DartClass {
    const dartClass: DartClass = {
        name: className,
        fields: new Map<string, string>(),
    };

    for (const [key, value] of Object.entries(obj)) {
        const fieldName = toCamelCase(key);
        const fieldType = getDartType(key, value, allClasses, numberTypes);
        dartClass.fields.set(fieldName, fieldType);
    }

    return dartClass;
}

function getDartType(
    key: string,
    value: any,
    allClasses: DartClass[],
    numberTypes: Map<string, "int" | "double">,
): string {
    if (value === null) {
        return "dynamic";
    }

    const type = typeof value;

    switch (type) {
        case "string":
            return "String";
        case "number":
            return numberTypes.get(key) || "double";
        case "boolean":
            return "bool";
        case "object":
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return "List<dynamic>";
                }
                const firstElement = value[0];
                if (typeof firstElement === "object" && firstElement !== null) {
                    const nestedClassName = capitalizeFirstLetter(singularize(key));
                    const nestedClass = parseJsonToClass(nestedClassName, firstElement, allClasses, numberTypes);
                    allClasses.push(nestedClass);
                    return `List<${nestedClassName}>`;
                }
                const elementType = getDartType("item", firstElement, allClasses, numberTypes);
                return `List<${elementType}>`;
            } else {
                const nestedClassName = capitalizeFirstLetter(key);
                const nestedClass = parseJsonToClass(nestedClassName, value, allClasses, numberTypes);
                allClasses.push(nestedClass);
                return nestedClassName;
            }
        default:
            return "dynamic";
    }
}

function generateClassCode(dartClass: DartClass): string {
    const fields = Array.from(dartClass.fields.entries());
    let code = `class ${dartClass.name} {\n`;

    // Fields
    for (const [fieldName, type] of fields) {
        code += `  ${type}? ${fieldName};\n`;
    }

    code += "\n";

    // Constructor
    code += `  ${dartClass.name}({`;
    code += fields.map(([fieldName]) => `this.${fieldName}`).join(", ");
    code += "});\n\n";

    // fromJson
    code += generateFromJson(dartClass.name, fields);

    // toJson
    code += generateToJson(fields);

    code += "}";

    return code;
}

function generateFromJson(className: string, fields: [string, string][]): string {
    let code = `  ${className}.fromJson(Map<String, dynamic> json) {\n`;

    for (const [fieldName, type] of fields) {
        // Get original JSON key (reverse camelCase)
        const jsonKey = getOriginalJsonKey(fieldName, fields);

        if (type.startsWith("List<")) {
            const innerType = type.match(/List<(.+)>/)?.[1];
            if (innerType && !["String", "int", "double", "bool", "dynamic"].includes(innerType)) {
                code += `    if (json['${jsonKey}'] != null) {\n`;
                code += `      ${fieldName} = <${innerType}>[];\n`;
                code += `      json['${jsonKey}'].forEach((v) {\n`;
                code += `        ${fieldName}!.add(${innerType}.fromJson(v));\n`;
                code += `      });\n`;
                code += `    }\n`;
            } else {
                code += `    ${fieldName} = json['${jsonKey}'] != null ? List<${innerType}>.from(json['${jsonKey}']) : null;\n`;
            }
        } else if (!["String", "int", "double", "bool", "dynamic"].includes(type)) {
            code += `    ${fieldName} = json['${jsonKey}'] != null ? ${type}.fromJson(json['${jsonKey}']) : null;\n`;
        } else if (type === "int") {
            code += `    ${fieldName} = (json['${jsonKey}'] as num?)?.toInt();\n`;
        } else if (type === "double") {
            code += `    ${fieldName} = (json['${jsonKey}'] as num?)?.toDouble();\n`;
        } else {
            code += `    ${fieldName} = json['${jsonKey}'];\n`;
        }
    }

    code += `  }\n\n`;
    return code;
}

function generateToJson(fields: [string, string][]): string {
    let code = `  Map<String, dynamic> toJson() {\n`;
    code += `    final Map<String, dynamic> data = <String, dynamic>{};\n`;

    for (const [fieldName, type] of fields) {
        const jsonKey = getOriginalJsonKey(fieldName, fields);

        if (type.startsWith("List<")) {
            const innerType = type.match(/List<(.+)>/)?.[1];
            if (innerType && !["String", "int", "double", "bool", "dynamic"].includes(innerType)) {
                code += `    if (${fieldName} != null) {\n`;
                code += `      data['${jsonKey}'] = ${fieldName}!.map((v) => v.toJson()).toList();\n`;
                code += `    }\n`;
            } else {
                code += `    data['${jsonKey}'] = ${fieldName};\n`;
            }
        } else if (!["String", "int", "double", "bool", "dynamic"].includes(type)) {
            code += `    if (${fieldName} != null) {\n`;
            code += `      data['${jsonKey}'] = ${fieldName}!.toJson();\n`;
            code += `    }\n`;
        } else {
            code += `    data['${jsonKey}'] = ${fieldName};\n`;
        }
    }

    code += `    return data;\n`;
    code += `  }\n`;
    return code;
}

// Helper to maintain original JSON key for field mapping
const jsonKeyMap = new Map<string, string>();

export function setJsonKeyMapping(fieldName: string, jsonKey: string): void {
    jsonKeyMap.set(fieldName, jsonKey);
}

function getOriginalJsonKey(fieldName: string, fields: [string, string][]): string {
    // Try to reverse engineer from camelCase
    // This is a simple heuristic - in production, you'd maintain a proper mapping
    return jsonKeyMap.get(fieldName) || fieldName;
}

export function toCamelCase(str: string): string {
    // Convert PascalCase or snake_case to camelCase
    if (str.includes("_")) {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
    return str.charAt(0).toLowerCase() + str.slice(1);
}

export function toSnakeCase(str: string): string {
    // Convert PascalCase to snake_case (e.g., CartModule -> cart_module)
    return str.replace(/([A-Z])/g, (match, letter, index) => {
        return index === 0 ? letter.toLowerCase() : "_" + letter.toLowerCase();
    });
}

export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function singularize(word: string): string {
    // Simple singularization
    if (word.endsWith("ies")) {
        return word.slice(0, -3) + "y";
    }
    if (word.endsWith("es")) {
        return word.slice(0, -2);
    }
    if (word.endsWith("s")) {
        return word.slice(0, -1);
    }
    return word;
}

export function detectNumberTypes(jsonString: string): Map<string, "int" | "double"> {
    const numberTypes = new Map<string, "int" | "double">();

    // Regex to find all key-value pairs with numbers
    // Matches: "key": 123 or "key": 123.456 or "key": 123.000
    const numberPattern = /"([^"]+)"\s*:\s*(-?\d+\.?\d*)/g;
    let match;

    while ((match = numberPattern.exec(jsonString)) !== null) {
        const key = match[1];
        const valueStr = match[2];

        // If has decimal point, it's double
        if (valueStr.includes(".")) {
            numberTypes.set(key, "double");
        } else {
            numberTypes.set(key, "int");
        }
    }

    return numberTypes;
}

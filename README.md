# JSON to Dart Model Generator

Quickly convert JSON to Dart model classes with `fromJson` and `toJson` methods for Flutter projects.

## ✨ Features

- 🚀 **Quick Conversion**: Convert JSON to Dart classes in seconds
- 🏗️ **Complete Model Generation**: Automatically generates:
    - Nullable fields with proper types
    - Constructor with named parameters
    - `fromJson()` factory method
    - `toJson()` method
- 🔄 **Smart Type Detection**:
    - Distinguishes between `int` and `double` from JSON decimal notation
    - Safe number casting to prevent runtime errors
    - Supports nested objects and arrays
- 📦 **Array Support**: Handles both object and array JSON inputs
- 🌐 **Multi-language**: English and Vietnamese interface
- 📁 **Auto File Naming**: Converts class names to snake_case for file names
- 🎯 **Workspace Integration**: Saves files directly to your project root

## 📖 Usage

### Basic Usage

1. Open Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux)
2. Type `JSON to Dart Model` and select the command
3. Enter your class name (e.g., `CartModule`)
4. Paste your JSON
5. File is automatically created and opened!

### Example

**Input JSON:**

```json
{
    "ErrorCode": 0,
    "ErrorDescription": "Success",
    "Data": {
        "id": 1,
        "items": [
            {
                "id": 787,
                "productName": "Product A",
                "price": 44000.0,
                "quantity": 1
            }
        ],
        "totalAmount": 44000.0
    }
}
```

**Output Dart Class:**

```dart
class CartModule {
  int? errorCode;
  String? errorDescription;
  Data? data;

  CartModule({this.errorCode, this.errorDescription, this.data});

  CartModule.fromJson(Map<String, dynamic> json) {
    errorCode = (json['ErrorCode'] as num?)?.toInt();
    errorDescription = json['ErrorDescription'];
    data = json['Data'] != null ? Data.fromJson(json['Data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['ErrorCode'] = errorCode;
    data['ErrorDescription'] = errorDescription;
    if (this.data != null) {
      data['Data'] = this.data!.toJson();
    }
    return data;
  }
}

class Data {
  int? id;
  List<Item>? items;
  double? totalAmount;

  Data({this.id, this.items, this.totalAmount});

  Data.fromJson(Map<String, dynamic> json) {
    id = (json['id'] as num?)?.toInt();
    if (json['items'] != null) {
      items = <Item>[];
      json['items'].forEach((v) {
        items!.add(Item.fromJson(v));
      });
    }
    totalAmount = (json['totalAmount'] as num?)?.toDouble();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    if (items != null) {
      data['items'] = items!.map((v) => v.toJson()).toList();
    }
    data['totalAmount'] = totalAmount;
    return data;
  }
}
```

### Array Input Support

You can also input JSON arrays directly:

```json
[
    {
        "id": 1,
        "name": "Product A"
    }
]
```

The extension will use the first element to generate the class structure.

## ⚙️ Extension Settings

This extension contributes the following settings:

- `jsonToDart.language`: Choose interface language
    - `en` - English (default)
    - `vi` - Tiếng Việt

### Changing Language

1. Open Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "JSON to Dart"
3. Select your preferred language

Or add to your `settings.json`:

```json
{
    "jsonToDart.language": "vi"
}
```

## 🎯 Smart Features

### Type Detection

- Numbers with decimal points → `double`
- Whole numbers → `int`
- Safe casting with `as num?` to handle both types from JSON

### Field Naming

- Automatically converts to camelCase: `ErrorCode` → `errorCode`
- Handles snake_case: `product_name` → `productName`

### File Naming

- Converts PascalCase to snake_case: `CartModule` → `cart_module.dart`
- Files are saved to workspace root

### Nested Objects

- Automatically creates separate classes for nested objects
- Singularizes array item names: `items` → `Item`

## 📋 Requirements

- VS Code 1.106.1 or higher
- A workspace/folder opened in VS Code

## 🐛 Known Issues

- Very large JSON inputs may require splitting into smaller chunks
- Complex nested structures with circular references are not supported

## 🔄 Release Notes

### 0.0.1

Initial release with features:

- JSON to Dart model conversion
- Nested objects and arrays support
- Smart type detection (int vs double)
- Multi-language support (EN/VI)
- Auto file naming and saving
- Safe number casting

---

## 📝 Tips

- **Keyboard Shortcut**: Consider adding a custom keyboard shortcut for quick access
- **Best Practice**: Always review generated code before using in production
- **File Overwrite**: Extension will prompt before overwriting existing files

**Enjoy coding! 🚀**

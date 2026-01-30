import * as vscode from "vscode";
import { getMessage } from "./i18n";
import { generateDartClasses } from "./dartGenerator";
import { detectNumberTypes, toSnakeCase, toCamelCase } from "./utils";

export function activate(context: vscode.ExtensionContext) {
    console.log("JSON to Dart extension is now active!");

    const disposable = vscode.commands.registerCommand("json-to-dart-3.convertJsonToDart", async () => {
        try {
            // Step 1: Ask for class name
            const className = await vscode.window.showInputBox({
                prompt: getMessage("classNamePrompt"),
                placeHolder: getMessage("classNamePlaceholder"),
                validateInput: (text) => {
                    if (!text || text.trim().length === 0) {
                        return getMessage("classNameEmpty");
                    }
                    if (!/^[A-Z][a-zA-Z0-9]*$/.test(text)) {
                        return getMessage("classNameInvalid");
                    }
                    return null;
                },
            });

            if (!className) {
                return;
            }

            // Step 2: Ask for JSON input
            const jsonInput = await vscode.window.showInputBox({
                prompt: getMessage("jsonPrompt"),
                placeHolder: getMessage("jsonPlaceholder"),
                validateInput: (text) => {
                    if (!text || text.trim().length === 0) {
                        return getMessage("jsonEmpty");
                    }
                    try {
                        JSON.parse(text);
                        return null;
                    } catch (e) {
                        return getMessage("jsonInvalid");
                    }
                },
            });

            if (!jsonInput) {
                return;
            }

            // Parse JSON and detect number types from string
            const numberTypes = detectNumberTypes(jsonInput);
            const jsonObj = JSON.parse(jsonInput);

            // Check if JSON is an array
            let dartCode: string;
            if (Array.isArray(jsonObj)) {
                if (jsonObj.length === 0) {
                    vscode.window.showErrorMessage(getMessage("emptyArray"));
                    return;
                }
                // Use first element to generate class
                dartCode = generateDartClasses(className, jsonObj[0], numberTypes);
            } else {
                // Generate Dart classes for object
                dartCode = generateDartClasses(className, jsonObj, numberTypes);
            }

            // Convert class name to snake_case for filename
            const fileName = toSnakeCase(className) + ".dart";

            // Get workspace folder
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage(getMessage("noWorkspace"));
                return;
            }

            // Save to workspace root folder
            const workspaceUri = workspaceFolders[0].uri;
            const fileUri = vscode.Uri.joinPath(workspaceUri, fileName);

            // Check if file already exists
            try {
                await vscode.workspace.fs.stat(fileUri);
                const overwrite = await vscode.window.showWarningMessage(
                    getMessage("fileExists", fileName),
                    getMessage("overwrite"),
                    getMessage("cancel"),
                );
                if (overwrite !== getMessage("overwrite")) {
                    return;
                }
            } catch {
                // File doesn't exist, continue
            }

            // Write file
            const encoder = new TextEncoder();
            await vscode.workspace.fs.writeFile(fileUri, encoder.encode(dartCode));

            // Open the saved file
            const doc = await vscode.workspace.openTextDocument(fileUri);
            await vscode.window.showTextDocument(doc);

            vscode.window.showInformationMessage(getMessage("success", fileName));
        } catch (error) {
            vscode.window.showErrorMessage(getMessage("error", String(error)));
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

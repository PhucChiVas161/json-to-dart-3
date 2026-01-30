import * as vscode from "vscode";
import enMessages from "./locales/en.json";
import viMessages from "./locales/vi.json";

type MessageKey = keyof typeof enMessages;

const messages: Record<"en" | "vi", typeof enMessages> = {
    en: enMessages,
    vi: viMessages,
};

export function getMessage(key: MessageKey, ...args: string[]): string {
    const config = vscode.workspace.getConfiguration("jsonToDart");
    const language = (config.get<string>("language") || "en") as "en" | "vi";
    let message = messages[language][key];

    // Replace placeholders {0}, {1}, etc.
    args.forEach((arg, index) => {
        message = message.replace(`{${index}}`, arg);
    });

    return message;
}

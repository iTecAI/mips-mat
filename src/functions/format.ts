import { TextDocument, TextEdit, FormattingOptions } from "vscode";
import { tokenize } from "./token";
import { getConfig } from "../types/Config";
import { columnize } from "./util";

export function formatDocument(
    document: TextDocument,
    options: FormattingOptions
): TextEdit[] {
    const tokenized = [];
    const config = getConfig();
    for (let i = 0; i < document.lineCount; i++) {
        tokenized.push(
            tokenize(
                document.lineAt(i),
                i > 0 ? document.lineAt(i - 1) : null,
                i < document.lineCount - 1 ? document.lineAt(i + 1) : null
            )
        );
    }

    for (const line of tokenized) {
        const columns: string[] = [];
        if (line.label) {
            columns[config.labelColumn] = line.label;
        }
        if (line.constant) {
            columns[config.labelColumn] = line.constant.text;
        }
        if (line.mnemonic) {
            columns[config.instructionColumn] = line.mnemonic.text;
        }
        if (line.params) {
            columns[config.paramColumn] = line.params.join(",");
        }

        console.log(columnize(columns, config));
    }

    return [];
}

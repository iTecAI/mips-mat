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

    const rawLines: string[] = [];

    for (const line of tokenized) {
        const toAdd: string[] = [];
        if (line.text.trim().length === 0) {
            toAdd.push("");
        }
        if (line.comment) {
            if (line.comment.block) {
                toAdd.push(line.comment.text);
            }
        } else {
            if (line.label) {
                toAdd.push(
                    columnize({ [config.labelColumn]: line.label }, config)
                );
            }

            const columns: { [key: number]: string } = {};
            if (line.constant) {
                columns[config.labelColumn] = line.constant.text;
            }
            if (line.mnemonic) {
                columns[config.instructionColumn] = line.mnemonic.text;
            }
            if (line.params) {
                columns[config.paramColumn] = line.params.join(",");
            }

            toAdd.push(columnize(columns, config));
        }

        rawLines.push(...toAdd);
    }

    console.log(rawLines.join("\n"));

    return [];
}

import { Range, TextDocument, TextEdit } from "vscode";
import { tokenize } from "./token";
import { getConfig } from "../types/Config";
import { columnize, createLine, smartWrap } from "./util";

export function formatDocument(document: TextDocument): TextEdit[] {
    try {
        const tokenized = [];
        const lineLengths = [];
        const config = getConfig();
        for (let i = 0; i < document.lineCount; i++) {
            lineLengths.push(document.lineAt(i).text.length);
            tokenized.push(
                tokenize(
                    document.lineAt(i),
                    i > 0 ? document.lineAt(i - 1) : null,
                    i < document.lineCount - 1 ? document.lineAt(i + 1) : null
                )
            );
        }

        const expandedLines: { lines: string[]; comment: string | null }[] = [];

        for (const line of tokenized) {
            const toAdd: string[] = [];
            if (line.text.trim().length === 0) {
                toAdd.push("");
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

            if (line.comment?.block) {
                toAdd.push(line.comment.text);
            } else {
                if (line.label) {
                    toAdd.push(
                        columnize({ [config.labelColumn]: line.label }, config)
                    );
                }

                if (Object.keys(columns).length > 0) {
                    toAdd.push(columnize(columns, config));
                }
            }

            expandedLines.push({
                lines: toAdd,
                comment:
                    line.comment && !line.comment.block
                        ? line.comment.text
                        : null,
            });
        }

        const minCommentAlignment = Math.max(
            ...expandedLines
                .filter(
                    (l) =>
                        l.comment &&
                        (l.lines.at(-1) ?? "").length +
                            config.commentSpace +
                            (l.comment ?? "").length <
                            config.lineLength
                )
                .map((l) => (l.lines.at(-1) ?? "").length + config.commentSpace)
        );

        const assembledLines: string[] = [];

        for (const line of expandedLines) {
            if (line.lines.length === 0) {
                assembledLines.push(line.comment ?? "");
                continue;
            }
            if (line.comment) {
                const spacing =
                    minCommentAlignment - (line.lines.at(-1) ?? "").length;
                if (
                    minCommentAlignment + line.comment.length >
                    config.lineLength
                ) {
                    assembledLines.push(...line.lines.slice(0, -1));
                    assembledLines.push(
                        ...smartWrap(
                            line.comment.trim().slice(1).trim(),
                            config.lineLength - 3
                        ).map((c) => "# " + c)
                    );
                    assembledLines.push(line.lines.at(-1) ?? "");
                } else {
                    assembledLines.push(
                        ...line.lines.slice(0, -1),
                        (line.lines.at(-1) ?? "") +
                            "".padEnd(spacing) +
                            line.comment
                    );
                }
            } else {
                assembledLines.push(...line.lines);
            }
        }
        return [
            ...lineLengths.map((len, i) =>
                TextEdit.delete(new Range(i, 0, i, len))
            ),
            ...assembledLines.map((line, i) =>
                createLine(line + (i >= document.lineCount - 1 ? "\n" : ""), i)
            ),
        ];
    } catch (e) {
        console.log(e);
        return [];
    }
}

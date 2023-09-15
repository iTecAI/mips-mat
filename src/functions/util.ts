import { Range, TextEdit } from "vscode";
import { Config } from "../types/Config";

export function createLine(text: string, line: number): TextEdit {
    const range = new Range(line, 0, line, 99999);
    return new TextEdit(range, text + "\n");
}

export function columnize(
    columns: (string | null | undefined)[],
    config: Config
): string {
    const result: string[] = [];
    for (let i = 0; i < columns.length; i++) {
        result.push((columns[i] ?? "").padEnd(config.columnWidth));
    }
    return result.join("").trimEnd();
}

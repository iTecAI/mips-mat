import { workspace } from "vscode";

export type Config = {
    columnWidth: number;
    commentSpace: number;
    instructionColumn: number;
    labelColumn: number;
    lineLength: number;
    paramColumn: number;
};

export function getConfig(): Config {
    return workspace.getConfiguration("mipsmat") as any;
}

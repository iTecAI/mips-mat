import { languages, workspace } from "vscode";
import { formatDocument } from "./functions/format";

export function activate() {
    languages.registerDocumentFormattingEditProvider("mips", {
        provideDocumentFormattingEdits: formatDocument,
    });

    console.log(workspace.getConfiguration("mipsmat"));
}

// This method is called when your extension is deactivated
export function deactivate() {}

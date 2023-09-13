import {TextDocument, TextEdit, FormattingOptions} from "vscode";

export function formatDocument(document: TextDocument, options: FormattingOptions): TextEdit[] {
    console.log(document.getText());
    return [];
}
import {TextDocument, TextEdit, FormattingOptions} from "vscode";
import { tokenize } from "./token";

export function formatDocument(
  document: TextDocument,
  options: FormattingOptions
): TextEdit[] {
  const tokenized = [];
  for (let i = 0; i < document.lineCount; i++) {
    tokenized.push(
      tokenize(
        document.lineAt(i),
        i > 0 ? document.lineAt(i - 1) : null,
        i < document.lineCount - 1 ? document.lineAt(i + 1) : null
      )
    );
  }

  console.log(tokenized);

  return [];
}
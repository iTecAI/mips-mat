import { TextLine } from "vscode";

export type Line = {
  text: string;
  line: TextLine;
  comment?: {
    text: string;
    block: null | "top" | "middle" | "bottom";
  };
  label?: string;
  mnemonic?: {
    text: string;
    type: "directive" | "instruction";
  };
  params?: string[];
};

export type LineTokens = {
    comment?: string;
    label?: string;
    mnemonic?: string;
    params?: string;
};

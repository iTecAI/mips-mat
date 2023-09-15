import { TextLine } from "vscode";

export type Line = {
    text: string;
    line: TextLine;
    comment?: {
        text: string;
        block: null | "top" | "bottom" | "single" | "middle";
    };
    label?: string;
    mnemonic?: {
        text: string;
        type: "directive" | "instruction";
    };
    params?: string[];
    constant?: {
        text: string;
        name: string;
        value: string;
    };
};

export type LineTokens = {
    comment?: string;
    label?: string;
    mnemonic?: string;
    params?: string;
};

import { TextLine } from "vscode";
import { Line, LineTokens } from "../types/Line";

function rawToken(text: string): LineTokens {
    const tokens: LineTokens = {};
    let tracking = "";
    let commenting = false;

    for (const char of text) {
        if (commenting) {
            tracking += char;
            continue;
        }
        if (char === "#") {
            if (tracking.trim().length > 0) {
                if (tracking.trim().endsWith(":") && !tokens.label) {
                    tokens.label = tracking.trim();
                } else if (!tokens.mnemonic) {
                    tokens.mnemonic = tracking.trim();
                } else {
                    tokens.params = tracking.trim();
                }
            }

            commenting = true;
            tracking = "#";
            continue;
        }

        if (char === ":" && !tokens.label) {
            tokens.label = (tracking + char).trim();
            tracking = "";
            continue;
        }

        if (char === " " && !tokens.mnemonic) {
            tokens.mnemonic = tracking.trim();
            tracking = "";
            continue;
        }

        tracking += char;
    }

    if (commenting) {
        tokens.comment = tracking.trim();
    } else if (!tokens.label && tracking.trim().endsWith(":")) {
        tokens.label = tracking.trim();
    } else if (!tokens.mnemonic) {
        tokens.mnemonic = tracking.trim();
    } else {
        tokens.params = tokens.params ?? "" + tracking;
    }

    return tokens;
}

export function tokenize(
    line: TextLine,
    previous: TextLine | null,
    next: TextLine | null
): Line {
    const stripped = line.text.trim();
    const prStrip = (previous?.text ?? "").trim();
    const neStrip = (next?.text ?? "").trim();
    const lineData: Line = {
        text: stripped,
        line: line,
    };

    const token = rawToken(stripped);
    console.log(token);

    if (stripped.startsWith("#")) {
        if (prStrip.startsWith("#") && neStrip.startsWith("#")) {
            lineData.comment = {
                text: stripped,
                block: "middle",
            };
        } else if (prStrip.startsWith("#")) {
            lineData.comment = {
                text: stripped,
                block: "bottom",
            };
        } else if (neStrip.startsWith("#")) {
            lineData.comment = {
                text: stripped,
                block: "top",
            };
        } else {
            lineData.comment = {
                text: stripped,
                block: null,
            };
        }
    } else {
        if (token.comment) {
            lineData.comment = {
                text: token.comment,
                block: null,
            };
        }

        if (token.label) {
            lineData.label = token.label;
        }
    }

    return lineData;
}

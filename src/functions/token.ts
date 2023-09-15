import { TextLine } from "vscode";
import { Line, LineTokens } from "../types/Line";

function rawToken(text: string): LineTokens {
    const tokens: LineTokens = {};
    let tracking = "";
    let commenting = false;
    let quoting = false;

    for (const char of text) {
        if (commenting) {
            tracking += char;
            continue;
        }
        if (char === '"') {
            quoting = !quoting;
        }
        if (quoting) {
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

    if (tracking.trim().length > 0) {
        if (commenting) {
            tokens.comment = tracking.trim();
        } else if (!tokens.label && tracking.trim().endsWith(":")) {
            tokens.label = tracking.trim();
        } else if (!tokens.mnemonic) {
            tokens.mnemonic = tracking.trim();
        } else {
            tokens.params = tokens.params ?? "" + tracking;
        }
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

    if (token.comment) {
        if (token.label || token.mnemonic || token.params) {
            lineData.comment = {
                text: token.comment,
                block: null,
            };
        } else {
            if (prStrip.startsWith("#") && neStrip.startsWith("#")) {
                lineData.comment = {
                    text: token.comment,
                    block: "middle",
                };
            } else if (prStrip.startsWith("#")) {
                lineData.comment = {
                    text: token.comment,
                    block: "bottom",
                };
            } else if (neStrip.startsWith("#")) {
                lineData.comment = {
                    text: token.comment,
                    block: "top",
                };
            } else {
                lineData.comment = {
                    text: token.comment,
                    block: "single",
                };
            }
        }
    }

    if (
        token.mnemonic &&
        (token.mnemonic + (token.params ?? "")).includes("=")
    ) {
        const normalized = (token.mnemonic + (token.params ?? ""))
            .split("=", 2)
            .map((s) => s.trim())
            .join(" = ");
        lineData.constant = {
            text: normalized,
            name: normalized.split(" = ")[0],
            value: normalized.split(" = ")[1],
        };
    }

    if (token.label) {
        lineData.label = token.label;
    }

    if (token.mnemonic && !lineData.constant) {
        lineData.mnemonic = {
            text: token.mnemonic,
            type: token.mnemonic.startsWith(".") ? "directive" : "instruction",
        };
    }

    if (token.params && !lineData.constant) {
        lineData.params = token.params.split(",").map((s) => s.trim());
    }

    return lineData;
}

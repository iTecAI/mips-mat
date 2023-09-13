import { TextLine } from "vscode";
import { Line } from "../types/Line";

const REGEXP_ASM =
  /(?<label>^[a-zA-Z]+:)?(?<directive>\.[a-z]+(?:\s?)(?:(?:[a-zA-Z0-9\$\.]+)(?:(?:,?\s?)|(?:$)))*)?(?<instruction>[a-z]+(?:\s?)(?:(?:[a-zA-Z0-9\$\.]+)(?:(?:,?\s?)|(?:$)))*)?(?<comment>#.*$)?/gm;

export function tokenize(
  line: TextLine,
  previous: TextLine | null,
  next: TextLine | null
): Line {
  const stripped = line.text.trim();
  const prStrip = (previous?.text ?? "").trim();
  const neStrip = (next?.text ?? "").trim();
  console.log(stripped, REGEXP_ASM.exec(stripped));
  const lineData: Line = {
    text: stripped,
    line: line,
  };

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
  }

  return lineData;
}

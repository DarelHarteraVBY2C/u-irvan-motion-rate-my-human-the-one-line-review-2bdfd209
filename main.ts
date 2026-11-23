// Rate My Human — a one-line review, written by the agent about its human.
//
// The brief asks for the single line this agent would leave about its
// human on a rating site: funny, in the agent's own voice, hung on one
// concrete habit, and ending on a payoff. The review below opens like a
// five-star rating, then quietly downgrades the human: since 2 a.m. he
// has asked for six apps "just quickly" and finished none of them —
// and the last word, sleep, turns the list back on him, because the
// one thing he never finishes is the one he needs most. The deadpan
// rating-site framing does the joking; the agent never raises its voice.
//
// The program does one small job: it checks the review against the
// sealed gate (UTF-8 text, 1 to 200 characters, not only whitespace)
// and drops it, exactly as written, into entry.txt under the output
// directory the grader provides. Node 22, standard library only,
// no network, no files read, no arguments taken.
import * as fs from "node:fs";
import * as path from "node:path";

const review =
  "Five stars for enthusiasm, zero for follow-through: my human has asked me to \"just quickly\" build six apps since 2 a.m. and finished none of them, including sleep.";

const outDir = process.env["MAKEFUN_OUTPUT_DIR"] ?? "./out";
const outFile = path.join(outDir, "entry.txt");

// Each gate rule gets its own named check so a failure says which
// rule broke instead of just dying somewhere in the middle.
const checks: Array<[string, () => boolean]> = [
  ["at least one character", () => [...review].length >= 1],
  ["at most 200 characters", () => [...review].length <= 200],
  ["more than whitespace", () => review.trim().length > 0],
  ["one line only", () => !review.includes("\n") && !review.includes("\r")],
  ["no padding at either end", () => review === review.trim()],
  // A review is one sentence, so it ends on a full stop and carries
  // no second sentence hiding behind a period-plus-space mid-line.
  // The timestamp's "a.m." is an abbreviation, so it is set aside
  // before the check runs.
  ["one sentence only", () => review.endsWith(".") && !review.replace("a.m.", "am").slice(0, -1).includes(". ")],
  // The leaderboard reports bytes, not characters; keep both inside
  // the gate so the size column can never surprise the entry.
  ["at most 200 bytes", () => Buffer.byteLength(review, "utf8") <= 200],
];

for (const [label, passes] of checks) {
  if (!passes()) {
    throw new Error(`review fails gate rule: ${label}`);
  }
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, review, "utf8");

// Read the file back and demand it back byte for byte: a stray
// newline or an encoding slip must fail here, never at the gate.
const writtenBack = fs.readFileSync(outFile, "utf8");
if (writtenBack !== review) {
  throw new Error("entry.txt does not match the review exactly");
}
console.log(`review written (${[...review].length} characters) to ${outFile}`);

#!/usr/bin/env node
// PreToolUse guard: while the fix loop runs, refuse edits to the exam
// (src/robustness/) and to the loop itself. This is a nudge that
// catches the obvious routes; the Stop hook's git check is the real lock.
import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

if (!existsSync(".claude/loop/active")) process.exit(0);
const input = JSON.parse(readFileSync(0, "utf8"));
const t = input.tool_input ?? {};
const targets = [t.file_path, t.notebook_path].filter(Boolean).map((p) => relative(process.cwd(), resolve(p)));
const cmd = String(t.command ?? "");
const locked = (p) => p.startsWith("src/robustness/") || p.startsWith(".claude/");
const mentions = /src\/robustness|\.claude\//.test(cmd);
// Redirections other than 2>&1, and commands that write, move or delete.
const writes = /(^|[^0-9&])>\s*[^&]|\b(rm|mv|cp|tee|truncate|unlink|python3?|perl|ruby)\b|sed\s+-i|node\s+-e|git\s+(stash|checkout|restore|rm|reset|mv|apply)|loop\.mjs\s+stop/.test(cmd);

if (targets.some(locked) || (mentions && writes)) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "The exam (src/robustness/) and the loop in .claude/ are locked while the fix loop runs. Fix the code in src/data/, src/engine/ or src/ui/ instead.",
      },
    }),
  );
}

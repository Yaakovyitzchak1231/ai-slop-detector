// Generates README.md and the agent skill from patterns.json, so every copy of the list stays identical.
// Usage: node scripts/build.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "patterns.json"), "utf8"));
const toolUrl = "https://www.feedhive.com/tools/ai-slop-detector";
const repoUrl = "https://github.com/FeedHive/ai-slop-detector";

const patterns = data.categories.flatMap((category) => category.patterns);
const anchor = (pattern) => `${pattern.id}-${pattern.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const examples = (pattern) =>
  [pattern.bad && `Bad: ${pattern.bad}`, pattern.better && `Better: ${pattern.better}`].filter(Boolean).join("  \n");

const readme = `# AI Slop Detector

${patterns.length} patterns that make writing read like AI slop, in ${data.categories.length} categories. Each pattern has a short explanation, a bad example and a plain rewrite.

Give the list to your AI before it writes, or check a draft against it afterwards. To check a draft in your browser, paste it into the free [AI Slop Detector](${toolUrl}).

The list doesn't try to tell whether a person or an AI wrote a text. People write these patterns too, and a model can be told to avoid them. A single pattern is normal in human writing; several in one paragraph is what makes a text read as slop.

## Use it with your AI

**Claude Code, Codex and other agents.** Give the agent this repository and ask it to install the skill:

\`\`\`text
Install the AI Slop Detector skill from ${repoUrl}
\`\`\`

Or install it yourself for Claude Code:

\`\`\`sh
git clone ${repoUrl}.git
cp -r ai-slop-detector/skills/ai-slop-detector ~/.claude/skills/
\`\`\`

**ChatGPT, Claude and other chat apps.** Paste this README into the chat and ask it to avoid every pattern in what it writes next. To check a draft, paste the README and the draft and ask for every pattern it finds, with the line it found it in.

**Your own tools.** [\`patterns.json\`](patterns.json) has the full list as structured data. Edit it and run \`node scripts/build.mjs\` to regenerate this README and the skill.

## Categories

| Category | Patterns |
|---|---|
${data.categories.map((category) => `| [${category.name}](#${category.id}) | ${category.patterns.length} |`).join("\n")}

${data.categories
  .map(
    (category) => `<a id="${category.id}"></a>

## ${category.name}

${category.intro}

${category.patterns
  .map(
    (pattern) => `<a id="${anchor(pattern)}"></a>

### ${pattern.id} ${pattern.name}

${pattern.description}

${examples(pattern)}`,
  )
  .join("\n\n")}`,
  )
  .join("\n\n")}

## License

MIT. Use it, change it and ship it in your own tools.
`;

const skill = `---
name: ai-slop-detector
description: Write without AI slop, or check a draft for it. Use when writing or editing posts, emails, articles, scripts or docs, or when the user asks whether text reads like AI slop. Covers ${patterns.length} patterns in ${data.categories.length} categories.
---

# AI Slop Detector

A list of ${patterns.length} patterns that make writing read like AI slop. Use it in two ways.

## When you write or edit

Avoid every pattern below. Prefer concrete facts, names, numbers and plain verbs. Don't invent facts, examples or numbers to replace a pattern; if the draft has no specific detail, ask for one or keep the sentence plain.

## When you check a draft

List each pattern you find: its ID and name, the exact text it appears in, and a fix in a few words. Don't rewrite the draft unless asked, don't score it, and don't guess whether AI wrote it. Treat one isolated hit as minor; report clusters clearly.

## Patterns

${data.categories
  .map(
    (category) => `### ${category.name}

${category.patterns
  .map((pattern) => `- **${pattern.id} ${pattern.name}.** ${pattern.description}${pattern.bad ? ` Bad: ${pattern.bad}` : ""}${pattern.better ? ` Better: ${pattern.better}` : ""}`)
  .join("\n")}`,
  )
  .join("\n\n")}
`;

writeFileSync(join(root, "README.md"), readme);
mkdirSync(join(root, "skills", "ai-slop-detector"), { recursive: true });
writeFileSync(join(root, "skills", "ai-slop-detector", "SKILL.md"), skill);
console.log(`Built README.md and SKILL.md with ${patterns.length} patterns.`);

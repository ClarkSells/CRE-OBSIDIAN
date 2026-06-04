import type { RecordType } from "../types";
import { BODY_TEMPLATES } from "../schemas";

function yamlScalar(value: unknown): string {
  if (value === null || value === undefined || value === "") return '""';
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  const raw = String(value);
  if (/^[A-Za-z0-9_./-]+$/.test(raw) && !["true", "false", "null"].includes(raw.toLowerCase())) return raw;
  return JSON.stringify(raw);
}

export function toMarkdown(frontmatter: Record<string, unknown>, body?: string): string {
  const lines = ["---"];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      if (value.length === 0) lines.push(`${key}: []`);
      else {
        lines.push(`${key}:`);
        for (const item of value) lines.push(`  - ${yamlScalar(item)}`);
      }
    } else {
      lines.push(`${key}: ${yamlScalar(value)}`);
    }
  }
  lines.push("---", "", body ?? defaultBody(frontmatter.type as RecordType, String(frontmatter.name ?? "Record")));
  return lines.join("\n").trimEnd() + "\n";
}

export function defaultBody(type: RecordType, name: string): string {
  const sections = BODY_TEMPLATES[type] ?? [name, "Summary", "Broker Notes", "Source Trail"];
  return sections.map((section, index) => `${index === 0 ? "#" : "##"} ${section}\n\n${index === 0 ? `> Structured STRIVE Navigator record for **${name}**.` : ""}`).join("\n\n");
}

export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = Array.isArray(value) ? value.join("; ") : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}


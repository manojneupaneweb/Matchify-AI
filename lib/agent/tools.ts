const STOP = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'you', 'are', 'our', 'will',
  'job', 'role', 'work', 'team', 'years', 'year', 'using', 'have', 'has', 'been',
]);

export function extractKeywords(text: string): string[] {
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9+#]+/)) {
    if (raw.length < 3 || STOP.has(raw)) continue;
    counts.set(raw, (counts.get(raw) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word);
}

export function rewriteBullet(bullet: string, keywords: string[]): string {
  const missing = keywords.filter((word) => !bullet.toLowerCase().includes(word.toLowerCase()));
  if (missing.length === 0) return bullet.trim();
  const base = bullet.trim().replace(/\.$/, '');
  return `${base}, including ${missing.slice(0, 3).join(', ')}.`;
}

export const toolDeclarations = [
  {
    name: 'extract_keywords',
    description: 'Pull the most repeated skill-like words from a block of untrusted text. Call this before you list skills.',
    parameters: {
      type: 'OBJECT',
      properties: { text: { type: 'STRING' } },
      required: ['text'],
    },
  },
  {
    name: 'rewrite_bullet',
    description: 'Rewrite one resume bullet so it mentions the given keywords. Call this when a bullet is missing a required skill.',
    parameters: {
      type: 'OBJECT',
      properties: {
        bullet: { type: 'STRING' },
        keywords: { type: 'ARRAY', items: { type: 'STRING' } },
      },
      required: ['bullet', 'keywords'],
    },
  },
];

export function runTool(name: string, args: Record<string, unknown>) {
  if (name === 'extract_keywords') {
    return { keywords: extractKeywords(String(args.text || '')) };
  }
  if (name === 'rewrite_bullet') {
    const keywords = Array.isArray(args.keywords) ? args.keywords.map(String) : [];
    return { bullet: rewriteBullet(String(args.bullet || ''), keywords) };
  }
  return { error: `Unknown tool ${name}` };
}

export type JsonObject = Record<string, unknown>;

export function isJsonObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function getObject(value: JsonObject | undefined, key: string): JsonObject | undefined {
  const candidate = value?.[key];
  return isJsonObject(candidate) ? candidate : undefined;
}

export function getString(value: JsonObject | undefined, key: string): string | undefined {
  const candidate = value?.[key];
  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate.trim()
    : undefined;
}

export function getBoolean(value: JsonObject | undefined, key: string): boolean | undefined {
  const candidate = value?.[key];
  return typeof candidate === 'boolean' ? candidate : undefined;
}

export function getArray(value: JsonObject | undefined, key: string): unknown[] {
  const candidate = value?.[key];
  return Array.isArray(candidate) ? candidate : [];
}

export function getStringArray(value: JsonObject | undefined, key: string): string[] {
  return getArray(value, key).filter((item): item is string => typeof item === 'string');
}

export function hasProperty(value: JsonObject | undefined, key: string): boolean {
  return value !== undefined && Object.hasOwn(value, key);
}

function appendJsonLdNode(value: unknown, nodes: JsonObject[]): void {
  if (!isJsonObject(value)) return;
  const graph = getArray(value, '@graph');
  if (graph.length > 0) {
    for (const graphNode of graph) {
      if (isJsonObject(graphNode)) nodes.push(graphNode);
    }
    return;
  }
  nodes.push(value);
}

export function parseJsonLdDocuments(documents: string[]): {
  invalidCount: number;
  nodes: JsonObject[];
} {
  const nodes: JsonObject[] = [];
  let invalidCount = 0;
  for (const document of documents) {
    try {
      const parsed: unknown = JSON.parse(document);
      if (Array.isArray(parsed)) {
        for (const item of parsed) appendJsonLdNode(item, nodes);
      } else {
        appendJsonLdNode(parsed, nodes);
      }
    } catch {
      invalidCount += 1;
    }
  }
  return { invalidCount, nodes };
}

export function nodeHasType(node: JsonObject, candidates: readonly string[]): boolean {
  const rawType = node['@type'];
  const types = Array.isArray(rawType) ? rawType : [rawType];
  return types.some(
    (type) =>
      typeof type === 'string' &&
      candidates.some((candidate) => type.toLowerCase().includes(candidate.toLowerCase())),
  );
}

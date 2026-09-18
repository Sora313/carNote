export const FREQUENCY_UNITS = [
  { value: "unica", singular: "Única vez", plural: "Única vez" },
  { value: "dias", singular: "día", plural: "días" },
  { value: "semanas", singular: "semana", plural: "semanas" },
  { value: "meses", singular: "mes", plural: "meses" },
  { value: "anios", singular: "año", plural: "años" },
] as const;

export type FrequencyUnit = (typeof FREQUENCY_UNITS)[number]["value"];

const LEGACY_FREQUENCIES: Record<string, { count: number; unit: FrequencyUnit }> = {
  "una vez": { count: 1, unit: "unica" },
  semanal: { count: 1, unit: "semanas" },
  mensual: { count: 1, unit: "meses" },
  anual: { count: 1, unit: "anios" },
  "cada 6 meses": { count: 6, unit: "meses" },
};

export function formatFrequency(count: number, unit: FrequencyUnit): string {
  if (unit === "unica") return "Una vez";
  const def = FREQUENCY_UNITS.find((item) => item.value === unit);
  if (!def) return "Una vez";
  return `Cada ${count} ${count === 1 ? def.singular : def.plural}`;
}

export function parseFrequency(frequency: string): { count: number; unit: FrequencyUnit } {
  const legacy = LEGACY_FREQUENCIES[frequency.trim().toLowerCase()];
  if (legacy) return legacy;

  const match = frequency.match(/(\d+)\s+(\p{L}+)/u);
  if (match) {
    const count = Math.max(1, Number(match[1]));
    const rawUnit = match[2].toLowerCase();
    const def = FREQUENCY_UNITS.find(
      (item) => item.value === rawUnit || item.singular === rawUnit || item.plural === rawUnit,
    );
    if (def) return { count, unit: def.value };
  }

  return { count: 1, unit: "meses" };
}

export function computeNextDueDate(dateISO: string, frequency: string): Date | null {
  const { count, unit } = parseFrequency(frequency);
  if (unit === "unica" || count <= 0) return null;

  const next = new Date(dateISO);
  switch (unit) {
    case "dias":
      next.setDate(next.getDate() + count);
      break;
    case "semanas":
      next.setDate(next.getDate() + count * 7);
      break;
    case "meses":
      next.setMonth(next.getMonth() + count);
      break;
    case "anios":
      next.setFullYear(next.getFullYear() + count);
      break;
  }
  return next;
}

export function isExpenseDue(dateISO: string, frequency: string, now = new Date()): boolean {
  const next = computeNextDueDate(dateISO, frequency);
  return next !== null && next <= now;
}

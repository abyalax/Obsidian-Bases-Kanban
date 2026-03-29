/**
 * Simple utility functions for property formatting
 */

import { Value } from "obsidian";

/**
 * Formats tags from Obsidian Value types into a clean string array.
 * Uses internal Value methods for better compatibility with the Obsidian API.
 */
export function formatTags(
  value: Value | unknown[] | null | undefined,
): string[] {
  // 1. Guard for nullish or non-truthy values
  if (!value) return [];
  // 2. Handle native arrays (e.g., Obsidian MetadataCache tags)
  if (Array.isArray(value)) return processRawArray(value);
  // 3. Handle Obsidian Value object
  if (typeof value === "object" && "toString" in value) {
    const str = value.toString().trim();
    if (!str) return [];
    // 4. Handle JSON-stringified arrays inside Value
    if (str.startsWith("[") && str.endsWith("]")) {
      try {
        const parsed: unknown = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return processRawArray(parsed);
        }
      } catch {
        // Fallback to regex split if JSON is malformed
      }
    }
    // 5. Split by common delimiters (comma, hashtag, whitespace)
    return str
      .split(/[,#\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Helper to process unknown arrays into clean string arrays
 */
function processRawArray(items: unknown[]): string[] {
  return items
    .map((item) => {
      // Check if item is an Obsidian Value or a primitive
      if (item && typeof item === "object" && "toString" in item) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return item.toString().trim();
      }
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return String(item).trim();
    })
    .filter(Boolean);
}

/**
 * Format date to Indonesian readable format
 */
export function formatDateIndonesian(value: string | Date): string {
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return value.toString();

    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${monthName} ${year}`;
  } catch {
    return value.toString();
  }
}

/**
 * Generate color for tag based on static mapping
 */
export function getTagColor(tag: string): string {
  // Static color mapping for common tags using hex colors
  const staticColors: Record<string, string> = {
    // Priority tags
    urgent: "#9e0909",
    high: "#c94b07",
    medium: "#cc9112",
    low: "#0d8b3b",

    knowledge: "#3388ea",
    research: "#0891b2",
  };

  // Return static color if found, otherwise use hash-based color
  const lowerTag = tag.toLowerCase();
  if (staticColors[lowerTag]) return staticColors[lowerTag];
  // Fallback to hash-based colors for unknown tags using hex
  const colors = [
    "#dc2626",
    "#ea580c",
    "#ca8a04",
    "#ffc400",
    "#7686a8",
    "#16a34a",
    "#0891b2",
    "#2563eb",
    "#25375e",
  ];

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.codePointAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

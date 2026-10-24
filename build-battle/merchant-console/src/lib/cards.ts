import { CardCategory, CardStatus, Currency } from "@/data/types"

/**
 * The card vocabulary: what a card may be, and how it is shown.
 *
 * Everything here is pure and safe to import from a client component. The
 * generator lives in `./card-number` and the store lives in `@/data/cards`;
 * neither belongs in a browser bundle, so neither is imported from here.
 */

/** How a card number is shown everywhere except the creation response. */
export function maskLast4(last4: string): string {
  return `•••• ${last4}`
}

/** The largest limit ops may set, in minor units: 5,000,000. */
export const MAX_SPEND_LIMIT = 5_000_000

export const CURRENCIES: readonly Currency[] = ["USD", "EUR", "GBP"]

export const CARD_CATEGORIES: readonly CardCategory[] = [
  "advertising",
  "software",
  "travel",
  "contractors",
  "supplies",
]

export const CATEGORY_LABELS: Record<CardCategory, string> = {
  advertising: "Advertising",
  software: "Software",
  travel: "Travel",
  contractors: "Contractors",
  supplies: "Supplies",
}

export const CARD_STATUSES: readonly CardStatus[] = [
  "active",
  "frozen",
  "cancelled",
]

/**
 * `active ⇄ frozen`, either to `cancelled`, and `cancelled` is terminal.
 * Re-applying a status a card already holds is not a transition; the caller
 * asked for something that has already happened.
 */
const TRANSITIONS: Record<CardStatus, readonly CardStatus[]> = {
  active: ["frozen", "cancelled"],
  frozen: ["active", "cancelled"],
  cancelled: [],
}

export function canTransition(from: CardStatus, to: CardStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

import { describe, expect, it } from "vitest"
import { CardStatus } from "@/data/types"
import {
  CARD_CATEGORIES,
  CARD_STATUSES,
  CATEGORY_LABELS,
  CURRENCIES,
  canTransition,
  maskLast4,
} from "./cards"

/**
 * The state machine is the half of the card rules a UI cannot be trusted with:
 * one leaked edge brings a cancelled card back to life. The rest of this file
 * pins the vocabulary the form and the API validate against, so the two cannot
 * drift apart without a test going red.
 */

describe("maskLast4", () => {
  it("masks with the same bullets the payments table uses", () => {
    expect(maskLast4("4242")).toBe("•••• 4242")
  })
})

describe("canTransition", () => {
  it("allows a card to be frozen and thawed", () => {
    expect(canTransition("active", "frozen")).toBe(true)
    expect(canTransition("frozen", "active")).toBe(true)
  })

  it("allows either live status to be cancelled", () => {
    expect(canTransition("active", "cancelled")).toBe(true)
    expect(canTransition("frozen", "cancelled")).toBe(true)
  })

  it("treats cancelled as terminal", () => {
    for (const status of CARD_STATUSES) {
      expect(canTransition("cancelled", status)).toBe(false)
    }
  })

  it("refuses to re-apply a status the card already holds", () => {
    for (const status of CARD_STATUSES) {
      expect(canTransition(status, status)).toBe(false)
    }
  })

  it("permits exactly four edges across the whole machine", () => {
    const legal: [CardStatus, CardStatus][] = []
    for (const from of CARD_STATUSES) {
      for (const to of CARD_STATUSES) {
        if (canTransition(from, to)) legal.push([from, to])
      }
    }
    expect(legal).toEqual([
      ["active", "frozen"],
      ["active", "cancelled"],
      ["frozen", "active"],
      ["frozen", "cancelled"],
    ])
  })
})

describe("the allowlists", () => {
  it("offers exactly the three currencies the console supports", () => {
    expect(CURRENCIES).toEqual(["USD", "EUR", "GBP"])
  })

  it("gives every category a label, so the form cannot render a blank", () => {
    for (const category of CARD_CATEGORIES) {
      expect(CATEGORY_LABELS[category]).toBeTruthy()
    }
    expect(Object.keys(CATEGORY_LABELS).sort()).toEqual(
      [...CARD_CATEGORIES].sort(),
    )
  })
})

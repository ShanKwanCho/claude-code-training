import { describe, expect, it } from "vitest"
import {
  TEST_BIN,
  generateCardNumber,
  isLuhnValid,
  lastFour,
  luhnCheckDigit,
} from "./card-number"

/**
 * A generator that drifts off the 4242 BIN puts something PAN-shaped in the
 * repository, and a check digit that is merely usually right is a bug that
 * only shows up on the numbers nobody looked at. Both are cheap to assert
 * across enough draws to mean something.
 */

describe("luhnCheckDigit", () => {
  it("produces the digit that makes the whole number check out", () => {
    // 4242424242424242 is the canonical test PAN: payload 424242424242424,
    // check digit 2.
    expect(luhnCheckDigit("424242424242424")).toBe(2)
  })
})

describe("isLuhnValid", () => {
  it("accepts a number carrying the check digit its payload implies", () => {
    expect(isLuhnValid("4242424242424242")).toBe(true)
  })

  it("rejects a number with a tampered digit", () => {
    expect(isLuhnValid("4242424242424243")).toBe(false)
  })

  it("rejects a transposition the check digit is meant to catch", () => {
    expect(isLuhnValid("4242424242422442")).toBe(false)
  })

  it("rejects anything that is not all digits", () => {
    expect(isLuhnValid("4242-4242-4242-4242")).toBe(false)
    expect(isLuhnValid("")).toBe(false)
  })
})

describe("generateCardNumber", () => {
  const numbers = Array.from({ length: 500 }, () => generateCardNumber())

  it("always starts on the test BIN", () => {
    for (const number of numbers) {
      expect(number.startsWith(TEST_BIN)).toBe(true)
    }
  })

  it("always produces sixteen digits", () => {
    for (const number of numbers) {
      expect(number).toMatch(/^\d{16}$/)
    }
  })

  it("always carries a valid Luhn check digit", () => {
    for (const number of numbers) {
      expect(isLuhnValid(number)).toBe(true)
    }
  })

  it("is deterministic when handed a deterministic source", () => {
    const fixed = () => 0.5
    expect(generateCardNumber(fixed)).toBe(generateCardNumber(fixed))
  })

  it("stays valid at the extremes of its random source", () => {
    expect(isLuhnValid(generateCardNumber(() => 0))).toBe(true)
    expect(isLuhnValid(generateCardNumber(() => 0.999999))).toBe(true)
  })
})

describe("lastFour", () => {
  it("keeps only the last four digits", () => {
    expect(lastFour("4242424242429876")).toBe("9876")
  })
})

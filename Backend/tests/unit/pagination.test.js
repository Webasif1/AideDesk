import { describe, expect, it } from "vitest";
import { clampInt, pageMeta, parsePaging } from "../../src/utils/pagination.js";

describe("parsePaging", () => {
  it("defaults when nothing is supplied", () => {
    expect(parsePaging({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it("never produces a negative skip", () => {
    // ?page=0 previously produced skip:-10, which Mongo rejects — surfacing as
    // a 500 to anyone who edited the URL.
    for (const page of [0, -1, -999, "0", "-5"]) {
      expect(parsePaging({ page, limit: 10 }).skip).toBeGreaterThanOrEqual(0);
      expect(parsePaging({ page, limit: 10 }).page).toBe(1);
    }
  });

  it("treats garbage as the default page", () => {
    for (const page of ["abc", "", null, undefined, {}, NaN, "1e999"]) {
      expect(parsePaging({ page }).page).toBeGreaterThanOrEqual(1);
    }
  });

  it("clamps limit to maxLimit", () => {
    expect(parsePaging({ limit: 100000 }).limit).toBe(100);
    expect(parsePaging({ limit: 100000 }, { maxLimit: 50 }).limit).toBe(50);
  });

  it("floors limit at 1", () => {
    for (const limit of [0, -5, "0"]) expect(parsePaging({ limit }).limit).toBe(1);
  });

  it("computes skip from clamped values", () => {
    expect(parsePaging({ page: 3, limit: 25 })).toEqual({ page: 3, limit: 25, skip: 50 });
  });

  it("accepts numeric strings", () => {
    expect(parsePaging({ page: "4", limit: "10" })).toEqual({ page: 4, limit: 10, skip: 30 });
  });
});

describe("pageMeta", () => {
  it("reports at least one page even when empty", () => {
    expect(pageMeta(0, { page: 1, limit: 20 })).toEqual({ page: 1, limit: 20, total: 0, pages: 1 });
  });

  it("rounds partial pages up", () => {
    expect(pageMeta(41, { page: 1, limit: 20 }).pages).toBe(3);
  });
});

describe("clampInt", () => {
  it("clamps and falls back", () => {
    expect(clampInt("999", { min: 1, max: 60, fallback: 14 })).toBe(60);
    expect(clampInt("-3", { min: 1, max: 60, fallback: 14 })).toBe(1);
    expect(clampInt("nope", { min: 1, max: 60, fallback: 14 })).toBe(14);
  });
});

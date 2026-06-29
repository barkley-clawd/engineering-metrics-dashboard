import { describe, expect, it } from "@jest/globals";
import { formatCost } from "@/lib/format-cost";

describe("formatCost", () => {
  it('returns "—" for null', () => {
    expect(formatCost(null)).toBe("—");
  });

  it('returns "—" for undefined', () => {
    expect(formatCost(undefined)).toBe("—");
  });

  it('returns "$0.00" for 0', () => {
    expect(formatCost(0)).toBe("$0.00");
  });

  it('rounds "$1.34445736" to "$1.34"', () => {
    expect(formatCost(1.34445736)).toBe("$1.34");
  });

  it('returns "$1.25" for 1.25', () => {
    expect(formatCost(1.25)).toBe("$1.25");
  });

  it('adds thousand separators and trailing zero', () => {
    expect(formatCost(1234.5)).toBe("$1,234.50");
  });

  it("uses the requested currency", () => {
    expect(formatCost(1.25, "USD")).toBe("$1.25");
  });
});

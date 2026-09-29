import assert from "node:assert/strict";
import test from "node:test";
import { summarizeStaffSales } from "../src/services/revenue.js";

test("DATA2 totals use adjusted amounts and keep unassigned sales", () => {
  const now = new Date("2026-09-29T10:00:00Z");
  const result = summarizeStaffSales([
    { date: new Date(2026, 8, 29, 9), type: "MB", price: 2000, adjustedPrice: 1500, employee: "ปราย" },
    { date: new Date(2026, 8, 29, 10), type: "PT", price: 3000, employee: "เมล" },
    { date: new Date(2026, 8, 29, 11), type: "MB", price: "500", employee: "" },
    { date: new Date(2026, 8, 28, 12), type: "PT", price: 900, employee: "เมล" },
    { date: new Date(2026, 7, 29), type: "MB", price: 8000 },
  ], now);

  assert.deepEqual(result.monthSales, { mb: 2000, pt: 3900, club: 5900 });
  assert.deepEqual(result.todaySales, { mb: 2000, pt: 3000, club: 5000 });
  assert.deepEqual(result.employeeSales, [
    { name: "เมล", mb: 0, pt: 3900 },
    { name: "ปราย", mb: 1500, pt: 0 },
  ]);
});

test("invalid rows do not enter sales totals", () => {
  const result = summarizeStaffSales([
    { date: new Date(2026, 8, 29), type: "Other", price: 100 },
    { date: new Date(2026, 8, 29), type: "MB", price: "" },
  ], new Date("2026-09-29T10:00:00Z"));
  assert.deepEqual(result.monthSales, { mb: 0, pt: 0, club: 0 });
});

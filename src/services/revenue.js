const REVENUE_SHEET_ID = "11JY-u1njafkk_zIQSX4N-FQIRvvXGoTwR9MWkNkT3s4";
const DATA2_GID = "755413768";

function parseGvizDate(value) {
  if (typeof value !== "string") return null;
  const parts = value.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/);
  if (!parts) return null;
  return new Date(Number(parts[1]), Number(parts[2]), Number(parts[3]), Number(parts[4] || 0), Number(parts[5] || 0), Number(parts[6] || 0));
}

function amount(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function thaiDateParts(now) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(now);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
}

export function summarizeStaffSales(records, now = new Date()) {
  const { year, month, day } = thaiDateParts(now);
  const monthSales = { mb: 0, pt: 0, club: 0 };
  const todaySales = { mb: 0, pt: 0, club: 0 };
  const byEmployee = new Map();

  for (const row of records) {
    const type = String(row.type || "").trim().toUpperCase();
    if (!row.date || (type !== "MB" && type !== "PT")) continue;
    if (row.date.getFullYear() !== year || row.date.getMonth() + 1 !== month) continue;
    const value = amount(row.adjustedPrice) ?? amount(row.price);
    if (value === null) continue;

    const key = type.toLowerCase();
    monthSales[key] += value;
    monthSales.club += value;
    if (row.date.getDate() === day) {
      todaySales[key] += value;
      todaySales.club += value;
    }

    const employee = String(row.employee || "").trim();
    if (employee) {
      const current = byEmployee.get(employee) || { name: employee, mb: 0, pt: 0 };
      current[key] += value;
      byEmployee.set(employee, current);
    }
  }

  return { monthSales, todaySales, employeeSales: [...byEmployee.values()].sort((a, b) => b.pt - a.pt) };
}

export async function fetchStaffSales() {
  const query = encodeURIComponent("select A,B,E,F,I");
  const url = `https://docs.google.com/spreadsheets/d/${REVENUE_SHEET_ID}/gviz/tq?tqx=out:json&gid=${DATA2_GID}&tq=${query}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Google Sheets ตอบกลับ ${response.status}`);
  const text = await response.text();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("รูปแบบข้อมูล DATA2 ไม่ถูกต้อง");
  const data = JSON.parse(text.slice(start, end + 1));
  if (data.status !== "ok") throw new Error(data.errors?.[0]?.message || "อ่าน DATA2 ไม่สำเร็จ");
  const records = (data.table?.rows || []).map(({ c = [] }) => ({
    date: parseGvizDate(c[0]?.v),
    type: c[1]?.v,
    price: c[2]?.v,
    adjustedPrice: c[3]?.v,
    employee: c[4]?.v,
  }));
  return summarizeStaffSales(records);
}

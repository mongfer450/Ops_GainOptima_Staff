import React, { useEffect, useState } from "react";
import {
  Dumbbell,
  TrendingUp,
  Users,
  FileText,
  UserPlus,
  Wallet,
  ClipboardList,
  ClipboardCheck,
  CalendarDays,
  FileSignature,
  Grid3x3,
  MessageCircle,
  Megaphone,
  Settings,
  ChevronLeft,
  Target,
  Tag,
  Image,
  Folder,
  ListChecks,
  Plus,
  Clock,
  AlertCircle,
  Filter,
  Pencil,
  X,
  Lock,
  LogOut,
  Check,
} from "lucide-react";

const GOLD = "#C9A227";
const GOLD_DARK = "#7A5E12";

// รหัสผ่านเข้าใช้งาน — เป็นแค่ตัวกันคนทั่วไปเปิดผ่านๆ เท่านั้น
// (ฝังอยู่ใน JS ที่ browser โหลดมา ใครเปิด view-source/network tab ก็เห็นได้ ไม่ใช่ความปลอดภัยจริงจัง
//  ถ้าต้องการปลอดภัยจริง แนะนำ Cloudflare Access แทน)
const OWNER_PASSWORD = "gainoptima2026";
const OWNER_AUTH_KEY = "gainoptima_owner_auth";

const REVENUE_SHEET_ID = "11JY-u1njafkk_zIQSX4N-FQIRvvXGoTwR9MWkNkT3s4";
const ATTENDANCE_SHEET_ID = "1xH5kKeXAqNaEZzheWAFZEKdQHbsMi55AipuoTkn_PoY";
const ATTENDANCE_SHEET_TAB = "การตอบแบบฟอร์ม 1";

// อ่านค่าจากช่องเดียวใน Google Sheet แบบ real-time โดยไม่ต้องมี backend
// (ใช้ Google Visualization API — sheet ต้องแชร์เป็น "Anyone with the link can view")
async function fetchCell(range) {
  const sheetName = encodeURIComponent("สรุปรวม");
  const url = `https://docs.google.com/spreadsheets/d/${REVENUE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}&range=${range}`;
  const res = await fetch(url);
  const text = await res.text();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
  const row = json.table && json.table.rows && json.table.rows[0];
  const cell = row && row.c && row.c[0];
  return cell ? cell.v : null;
}

function fmtBaht(n) {
  if (n === null || n === undefined) return "—";
  return "฿" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const GAIN_LOGO =
  "data:image/png;base64,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";

// gviz คืนค่าวันที่เป็นข้อความรูปแบบ "Date(YYYY,M,D,H,Min,S)" (เดือนเริ่มที่ 0)
function parseGvizDate(v) {
  if (typeof v !== "string") return null;
  const m = v.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m.map((x) => (x === undefined ? 0 : Number(x)));
  return new Date(y, mo, d, h, mi, s);
}

// ดึงรายการเช็คชื่อเข้างานของ "วันนี้" — คอลัมน์ A = เวลาเข้างาน, คอลัมน์ B = ชื่อพนักงาน
async function fetchTodayAttendance() {
  const sheetName = encodeURIComponent(ATTENDANCE_SHEET_TAB);
  const url = `https://docs.google.com/spreadsheets/d/${ATTENDANCE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}&range=A2:B500`;
  const res = await fetch(url);
  const text = await res.text();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
  const rows = (json.table && json.table.rows) || [];
  const today = new Date();

  const list = rows
    .map((r) => {
      const timeCell = r.c && r.c[0];
      const nameCell = r.c && r.c[1];
      const date = timeCell ? parseGvizDate(timeCell.v) : null;
      const name = nameCell ? nameCell.v : null;
      return { date, name };
    })
    .filter(
      (item) =>
        item.date &&
        item.name &&
        item.date.getFullYear() === today.getFullYear() &&
        item.date.getMonth() === today.getMonth() &&
        item.date.getDate() === today.getDate()
    )
    .sort((a, b) => a.date - b.date);

  return list;
}

function fmtTime(d) {
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function fmtThaiDate(d) {
  const buddhistYear = d.getFullYear() + 543;
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${buddhistYear}`;
}

// รันคำสั่ง query (SELECT ... GROUP BY ...) บนแท็บ DATA แบบ real-time ไม่ต้องมี backend
async function gvizQuery(tq) {
  const sheetName = encodeURIComponent("DATA");
  const url = `https://docs.google.com/spreadsheets/d/${REVENUE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}&tq=${encodeURIComponent(tq)}`;
  const res = await fetch(url);
  const text = await res.text();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
  const rows = (json.table && json.table.rows) || [];
  return rows.map((r) => ({ label: r.c && r.c[0] ? r.c[0].v : null, value: r.c && r.c[1] ? r.c[1].v || 0 : 0 }));
}

// ยอดขาย MB/PT แยกตามพนักงาน — จากแท็บ DATA (K=พนักงาน, I=ราคา, E=ประเภท)
async function fetchEmployeeSales() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [mbRows, ptRows] = await Promise.all([
    gvizQuery(`SELECT K, SUM(I) WHERE E = 'MB' AND C = ${month} AND D = ${year} GROUP BY K`),
    gvizQuery(`SELECT K, SUM(I) WHERE E = 'PT' AND C = ${month} AND D = ${year} GROUP BY K`),
  ]);
  const map = {};
  mbRows.forEach((r) => {
    if (!r.label) return;
    map[r.label] = map[r.label] || { mb: 0, pt: 0 };
    map[r.label].mb = r.value;
  });
  ptRows.forEach((r) => {
    if (!r.label) return;
    map[r.label] = map[r.label] || { mb: 0, pt: 0 };
    map[r.label].pt = r.value;
  });
  return Object.entries(map)
    .map(([name, v]) => ({ name, mb: v.mb, pt: v.pt }))
    .sort((a, b) => b.pt - a.pt);
}

// ยอดขาย MB/PT ของ "วันนี้" — จากแท็บ DATA เดียวกัน (คอลัมน์ B = วันที่)
async function fetchTodaySales() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const rows = await gvizQuery(`SELECT E, SUM(I) WHERE B = date '${dateStr}' GROUP BY E`);
  let mb = 0;
  let pt = 0;
  rows.forEach((r) => {
    if (r.label === "MB") mb = r.value;
    if (r.label === "PT") pt = r.value;
  });
  return { mb, pt, club: mb + pt };
}

// ยอดขาย MB/PT ของ "เดือนนี้" — รวมตรงจากคอลัมน์ E (ประเภท) เท่านั้น
// ไม่ผูกกับคอลัมน์ K (พนักงาน) เพราะแถว MB ทุกแถวยังไม่มีค่าในคอลัมน์นี้ (บั๊กฝั่ง Apps Script ที่ยังไม่ได้แก้)
async function fetchMonthSales() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const rows = await gvizQuery(`SELECT E, SUM(I) WHERE C = ${month} AND D = ${year} GROUP BY E`);
  let mb = 0;
  let pt = 0;
  rows.forEach((r) => {
    if (r.label === "MB") mb = r.value;
    if (r.label === "PT") pt = r.value;
  });
  return { mb, pt, club: mb + pt };
}

// นับจำนวนลูกค้าที่ซื้อแพ็กเกจเดือนนี้ แยก New/Renew ต่อ MB และ PT
// (คอลัมน์ L = ประเภทรายการ — PT เพิ่งเริ่มมีข้อมูลนี้ตั้งแต่แก้ script, ของเก่าก่อนหน้าจะว่าง/นับเป็น "อื่นๆ")
async function fetchMemberPackages() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [mbRows, ptRows] = await Promise.all([
    gvizQuery(`SELECT L, COUNT(A) WHERE E = 'MB' AND C = ${month} AND D = ${year} GROUP BY L`),
    gvizQuery(`SELECT L, COUNT(A) WHERE E = 'PT' AND C = ${month} AND D = ${year} GROUP BY L`),
  ]);
  const parse = (rows) => {
    const out = { newCount: 0, renewCount: 0, otherCount: 0 };
    rows.forEach((r) => {
      const label = (r.label || "").trim().toLowerCase();
      if (label === "new") out.newCount = r.value;
      else if (label === "renew") out.renewCount = r.value;
      else out.otherCount += r.value;
    });
    return out;
  };
  return { mb: parse(mbRows), pt: parse(ptRows) };
}

const GYMMO_LOGO =
  "data:image/png;base64,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";

const categories = [
  {
    id: "revenue",
    label: "รายรับ / รายจ่าย",
    description: "ยอดขาย คอมมิชชั่น ค่าใช้จ่าย",
    icon: TrendingUp,
    items: [
      {
        label: "Gain Optima — Revenue",
        description: "ยอดวันนี้ + รายวันทั้งเดือน",
        icon: TrendingUp,
        href: "https://docs.google.com/spreadsheets/d/11JY-u1njafkk_zIQSX4N-FQIRvvXGoTwR9MWkNkT3s4/edit",
      },
      {
        label: "คำนวณค่าคอม_PT",
        description: "คอมมิชชั่น PT ต่อลูกค้า",
        icon: TrendingUp,
        href: "https://docs.google.com/spreadsheets/d/1cI4VGPDGgv1vvqWy2Rrtv7fTbBygAi_l9eaAl78M8hs/edit",
      },
      {
        label: "Expense Tracking",
        description: "เช็คลิสต์ค่าใช้จ่ายรายเดือน",
        icon: Wallet,
        href: "https://docs.google.com/spreadsheets/d/13QUTSOoUkpCxTcgVsKu9RMXyT4PQQ-MhlByaWQXxIcg/edit",
      },
      {
        label: "การเงิน",
        description: "เอกสาร/หลักฐานการเงินใน Drive",
        icon: Folder,
        href: "https://drive.google.com/drive/u/0/folders/1k4mOVMmZyY-vMOtOc4nXRJzjftGQIgDh",
      },
    ],
  },
  {
    id: "forms",
    label: "แบบฟอร์ม",
    description: "ฟอร์มสมัครและขอเบิกเงิน",
    icon: FileText,
    items: [
      {
        label: "ฟอร์มสมัคร MB",
        description: "สมัครสมาชิก MB",
        icon: UserPlus,
        href: "https://docs.google.com/forms/d/e/1FAIpQLSdpAkyz7xEH185jI7OHEH19JIut2jWloa8dm44pIzGW0EgC6g/viewform",
      },
      {
        label: "ฟอร์มสมัคร PT",
        description: "สมัครแพ็กเกจ PT",
        icon: Dumbbell,
        href: "https://docs.google.com/forms/d/e/1FAIpQLSePqvl8De-2pAWmY61xVLQX-R0iRjUifkd_uBU18p9b5VKU3g/viewform",
      },
      {
        label: "ฟอร์มเบิกเงิน",
        description: "แบบฟอร์มขอเบิกเงิน",
        icon: Wallet,
        href: "https://docs.google.com/forms/d/e/1FAIpQLScxE2zxvT-EwHF1pKdNtKByBZk54ehqwNYMEbi_CFttiI9IFQ/viewform",
      },
    ],
  },
  {
    id: "records",
    label: "หลังกรอกฟอร์ม",
    description: "ข้อมูลหลังปิดการขาย + รายการเบิก",
    icon: ClipboardList,
    items: [
      {
        label: "หลังกรอก_PT/MB/เบิกเงิน",
        description: "ข้อมูลดิบหลังปิดการขาย",
        icon: ClipboardList,
        href: "https://docs.google.com/spreadsheets/d/1OXyNdqlLjvT1lvfE-uIZSTaVqaUoe6VfKUgaY6xDjc0/edit",
      },
    ],
  },
  {
    id: "contracts",
    label: "สัญญา",
    description: "เอกสารสัญญา MB และ PT",
    icon: FileSignature,
    items: [
      {
        label: "สัญญา MB",
        description: "เอกสารสัญญาสมาชิก MB",
        icon: FileSignature,
        href: "https://docs.google.com/document/d/1ey2s60EYX9TZ_wu9oAQ1ZcM2Al2ULaAtWYtOLt916Yg/edit?usp=share_link",
      },
      {
        label: "สัญญา PT",
        description: "เอกสารสัญญาแพ็กเกจ PT",
        icon: FileSignature,
        href: "https://docs.google.com/document/d/1nkHuz8ydD5jjrCZD_2zGuK_RacNCnt_RdHuP3fEzrps/edit?usp=sharing",
      },
    ],
  },
  {
    id: "attendance",
    label: "การเข้างาน",
    description: "เช็คชื่อเข้างานพนักงาน",
    icon: Users,
    items: [
      {
        label: "เช็คชื่อทำงาน_DB",
        description: "ฟอร์มเช็คชื่อเข้างานดิบ",
        icon: ClipboardCheck,
        href: "https://docs.google.com/spreadsheets/d/1xH5kKeXAqNaEZzheWAFZEKdQHbsMi55AipuoTkn_PoY/edit",
      },
      {
        label: "ตารางงาน",
        description: "ตารางเวรพนักงาน",
        icon: CalendarDays,
        href: "https://docs.google.com/spreadsheets/d/1pS7S_LH7gjZ7wgWspvXSAZO9llpQVMa9TEbq3GnGvTo/edit?gid=161842714#gid=161842714",
      },
    ],
  },
  {
    id: "other",
    label: "การตลาด",
    description: "LINE, โฆษณา, Meta Business",
    icon: Grid3x3,
    items: [
      {
        label: "LINE OA",
        description: "แจ้งเตือนลูกค้า",
        icon: MessageCircle,
        href: "https://manager.line.biz/account/@053zeiuh",
      },
      {
        label: "Meta Ads",
        description: "แคมเปญโฆษณา",
        icon: Megaphone,
        href: "https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=1661641184916973&business_id=1392220475703771&nav_entry_point=mbs_sub_nav",
      },
      {
        label: "Meta Business",
        description: "จัดการเพจและบัญชีธุรกิจ",
        icon: Settings,
        href: "https://business.facebook.com/latest/home?global_scope_id=1392220475703771&business_id=1392220475703771&page_id=949179078279202&asset_id=949179078279202&redirect_session_id=3dd36a3d-4e15-4300-8817-028568037edd",
      },
      {
        label: "ราคาแพคเกจ/โปรโมชั่น",
        description: "ดูราคาและโปรโมชั่นล่าสุด",
        icon: Tag,
        href: "https://canva.link/mdl0phvv8gblmcy",
      },
      {
        label: "คลัง Media",
        description: "ส่งงานคอนเทนต์ / ใช้ทำการตลาด",
        icon: Image,
        href: "https://drive.google.com/drive/folders/1eHAvUBqEpAz5QBnoBJ1XGnCxbBXZIhfs?usp=share_link",
      },
    ],
  },
];

// การ์ดแบบเดียวกันทั้งหมด — ไอคอนบน + ชื่อ + คำอธิบายสั้นๆ
// ใช้ทั้งการ์ดหมวดหมู่ (หน้าแรก) และการ์ดลิงก์ (หลังคลิกเข้าหมวด)
function IconCard({ icon: Icon, label, description, onClick, href }) {
  const content = (
    <>
      <div className="iconCardIcon" style={{ borderRadius: 14, background: `${GOLD}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={GOLD_DARK} />
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, textAlign: "center", lineHeight: 1.25 }}>{label}</div>
      <div style={{ fontSize: 9, color: "#9CA3AF", textAlign: "center", lineHeight: 1.25 }}>{description}</div>
    </>
  );

  const style = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    color: "#111318",
    background: "#FFFFFF",
    border: "1px solid #ECE9E1",
    borderRadius: 18,
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  if (href) {
    return (
      <a href={href} className="tap iconCard" style={style}>
        {content}
      </a>
    );
  }
  return (
    <button onClick={onClick} className="tap iconCard" style={style}>
      {content}
    </button>
  );
}

// ===== Task Tracker (mock data ตอนนี้ — เปลี่ยนเป็น fetch(WEB_APP_URL) เมื่อ deploy Apps Script Web App แล้ว) =====
const TASK_PRIORITY_COLOR = { สูง: "#DC2626", กลาง: "#F59E0B", ต่ำ: "#16A34A" };
// TASK_STATUSES = สถานะที่ตั้งเองได้ (ปุ่มบนการ์ด) — "เลยกำหนด" ไม่ได้อยู่ในนี้ เพราะคำนวณอัตโนมัติจากวันที่ ไม่ใช่กดเลือกเอง
const TASK_STATUSES = ["ให้งานแล้ว", "เสร็จแล้ว"];
// KANBAN_COLUMNS = คอลัมน์ที่โชว์จริงบนหน้าจอ (เพิ่ม "เลยกำหนด" แทรกไว้)
const KANBAN_COLUMNS = ["ให้งานแล้ว", "เลยกำหนด", "เสร็จแล้ว"];
const TASK_EMPLOYEES = ["ทั้งหมด", "ต้า", "Copter", "เมล", "เพชร", "ดีม", "เกม", "เป้", "จีจี้"];
const STATUS_STYLE = {
  ให้งานแล้ว: { bg: "#FEF8E9", border: "#F3E3B0", text: "#B7791F", dot: "#D69E2E" },
  เลยกำหนด: { bg: "#FDECEC", border: "#F5C2C2", text: "#B91C1C", dot: "#DC2626" },
  เสร็จแล้ว: { bg: "#EAF7EE", border: "#C6E9CF", text: "#15803D", dot: "#22C55E" },
};

const MOCK_TASKS = [
  { taskId: "T1", title: "ซ่อมลู่วิ่งตัวที่ 3", category: "ซ่อมบำรุง", assignees: ["ต้า"], status: "ให้งานแล้ว", priority: "สูง", dueDate: "2026-07-20T10:00" },
  { taskId: "T2", title: "สั่งซื้อผ้าเช็ดตัวเพิ่ม", category: "ทั่วไป", assignees: ["เมล"], status: "ให้งานแล้ว", priority: "กลาง", dueDate: "2026-07-25T18:00" },
  { taskId: "T3", title: "อัปเดตราคาแพ็กเกจในเพจ", category: "การตลาด", assignees: ["จีจี้", "เมล"], status: "ให้งานแล้ว", priority: "กลาง", dueDate: "2026-07-22T09:00" },
  { taskId: "T4", title: "ทำความสะอาดเครื่องปรับอากาศ", category: "ความสะอาด", assignees: ["เกม"], status: "ให้งานแล้ว", priority: "ต่ำ", dueDate: "2026-07-18T17:00" },
  { taskId: "T5", title: "เตรียมเอกสารต่อสัญญาเช่า", category: "เอกสาร", assignees: ["ต้า"], status: "เสร็จแล้ว", priority: "สูง", dueDate: "2026-07-15T12:00" },
];

function isTaskOverdue(dueDate, status) {
  if (status === "เสร็จแล้ว") return false;
  return new Date(dueDate) < new Date();
}

function fmtTaskDate(d) {
  const date = new Date(d);
  const dateStr = date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  const timeStr = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} ${timeStr}`;
}

// ค่าเริ่มต้นของ input datetime-local — วันนี้ เวลาปัจจุบัน
function defaultDueDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

const TASK_CATEGORY_COLORS = {
  ซ่อมบำรุง: { bg: "#FEE2E2", text: "#B91C1C" },
  ทั่วไป: { bg: "#F3F4F6", text: "#4B5563" },
  การตลาด: { bg: "#EDE9FE", text: "#6D28D9" },
  ความสะอาด: { bg: "#DBEAFE", text: "#1D4ED8" },
  เอกสาร: { bg: "#FCE7F3", text: "#BE185D" },
};
const TASK_CATEGORY_DEFAULT = { bg: `${GOLD}1A`, text: GOLD_DARK };

// การ์ดแสดง avatar ซ้อนกันของทุกคนที่ถูก assign + กดเปิด popover เลือกได้หลายคน (รวมปุ่ม "ทุกคน")
function AssigneeMultiPicker({ value, onChange, employees }) {
  const [open, setOpen] = useState(false);
  const assignees = value || [];

  const toggle = (name) => {
    if (assignees.includes(name)) onChange(assignees.filter((n) => n !== name));
    else onChange([...assignees, name]);
  };
  const selectAll = () => onChange(employees);
  const clearAll = () => onChange([]);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: -6,
          background: assignees.length ? `${GOLD}1F` : "#F3F4F6",
          border: "none",
          borderRadius: 20,
          padding: "3px 10px 3px 3px",
          cursor: "pointer",
        }}
      >
        {assignees.length === 0 ? (
          <>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#D1D5DB", color: "#FFFFFF", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ?
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginLeft: 6 }}>มอบหมาย</span>
          </>
        ) : (
          <>
            <div style={{ display: "flex" }}>
              {assignees.slice(0, 3).map((name, i) => (
                <div
                  key={name}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: GOLD_DARK,
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #FFFFFF",
                    marginLeft: i === 0 ? 0 : -7,
                  }}
                >
                  {name.charAt(0)}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: GOLD_DARK, marginLeft: 6, whiteSpace: "nowrap" }}>
              {assignees.length === 1 ? assignees[0] : `${assignees.length} คน`}
            </span>
          </>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 30 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              right: 0,
              zIndex: 31,
              background: "#FFFFFF",
              border: "1px solid #ECE9E1",
              borderRadius: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              padding: 10,
              width: 168,
            }}
          >
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button
                onClick={selectAll}
                style={{ flex: 1, fontSize: 10.5, fontWeight: 700, color: GOLD_DARK, background: `${GOLD}1A`, border: "none", borderRadius: 8, padding: "5px 0", cursor: "pointer" }}
              >
                ทุกคน
              </button>
              <button
                onClick={clearAll}
                style={{ flex: 1, fontSize: 10.5, fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", border: "none", borderRadius: 8, padding: "5px 0", cursor: "pointer" }}
              >
                ล้าง
              </button>
            </div>
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              {employees.map((name) => {
                const checked = assignees.includes(name);
                return (
                  <label
                    key={name}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 4px", cursor: "pointer", borderRadius: 6 }}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggle(name)} style={{ accentColor: GOLD_DARK }} />
                    <span style={{ fontSize: 12, fontWeight: checked ? 700 : 500, color: checked ? "#111318" : "#6B7280" }}>{name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TaskCard({ task, onStatusChange, onAssigneeChange, onUpdate, onDelete, employees }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ title: task.title, category: task.category, dueDate: task.dueDate });
  const overdue = isTaskOverdue(task.dueDate, task.status);
  const catColor = TASK_CATEGORY_COLORS[task.category] || TASK_CATEGORY_DEFAULT;

  const startEdit = () => {
    setDraft({ title: task.title, category: task.category, dueDate: task.dueDate });
    setIsEditing(true);
  };
  const saveEdit = () => {
    onUpdate(task.taskId, draft);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        padding: "14px 14px 12px",
        marginBottom: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        {isEditing ? (
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            style={{ flex: 1, fontSize: 13.5, fontWeight: 700, border: "1px solid #ECE9E1", borderRadius: 8, padding: "5px 8px", fontFamily: "inherit" }}
          />
        ) : (
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, color: "#111318", flex: 1 }}>{task.title}</div>
        )}
        <button
          onClick={isEditing ? saveEdit : startEdit}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: isEditing ? GOLD_DARK : "#D1D5DB", flexShrink: 0, borderRadius: 6 }}
        >
          {isEditing ? <Check size={16} /> : <Pencil size={14} />}
        </button>
        <button
          onClick={() => onDelete(task.taskId)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#D1D5DB", flexShrink: 0, borderRadius: 6 }}
        >
          <X size={15} />
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        {isEditing ? (
          <input
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            placeholder="หมวด"
            style={{ fontSize: 11, border: "1px solid #ECE9E1", borderRadius: 8, padding: "4px 8px", fontFamily: "inherit", width: 120 }}
          />
        ) : (
          <span style={{ fontSize: 10.5, fontWeight: 700, color: catColor.text, background: catColor.bg, padding: "3px 9px", borderRadius: 8 }}>
            {task.category}
          </span>
        )}
      </div>

      {/* footer: วันที่ (ซ้าย) + พนักงานที่มอบหมายได้หลายคน (ขวา, กดเปลี่ยนได้) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        {isEditing ? (
          <input
            type="datetime-local"
            value={draft.dueDate}
            onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
            style={{ fontSize: 11, border: "1px solid #ECE9E1", borderRadius: 8, padding: "4px 6px", fontFamily: "inherit" }}
          />
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: overdue ? "#DC2626" : "#9CA3AF",
              fontWeight: overdue ? 700 : 500,
            }}
          >
            {overdue ? <AlertCircle size={12} /> : <Clock size={12} />}
            {fmtTaskDate(task.dueDate)}
          </span>
        )}
        <AssigneeMultiPicker value={task.assignees} onChange={(v) => onAssigneeChange(task.taskId, v)} employees={employees} />
      </div>

      {/* เปลี่ยนสถานะ — กดย้ายคอลัมน์ */}
      <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
        {TASK_STATUSES.map((s) => {
          const active = task.status === s;
          return (
            <button
              key={s}
              onClick={() => onStatusChange(task.taskId, s)}
              style={{
                flex: 1,
                fontSize: 9.5,
                padding: "5px 0",
                borderRadius: 7,
                border: "none",
                background: active ? "#11131812" : "transparent",
                color: active ? "#111318" : "#D1D5DB",
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskTrackerPage({ onBack }) {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [employees, setEmployees] = useState(TASK_EMPLOYEES.filter((n) => n !== "ทั้งหมด"));
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignees, setNewAssignees] = useState([]);
  const [newPickerOpen, setNewPickerOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState(defaultDueDateTime());
  const [filterEmployee, setFilterEmployee] = useState("ทั้งหมด");
  const [openColumns, setOpenColumns] = useState({});
  const [manageEmployeesOpen, setManageEmployeesOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    // ของจริง: fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'add', title: newTitle, assignees: newAssignees, dueDate: newDueDate }) })
    setTasks([
      {
        taskId: "T" + Date.now(),
        title: newTitle.trim(),
        category: "ทั่วไป",
        assignees: newAssignees,
        status: "ให้งานแล้ว",
        priority: "กลาง",
        dueDate: newDueDate,
      },
      ...tasks,
    ]);
    setNewTitle("");
    setNewAssignees([]);
    setNewDueDate(defaultDueDateTime());
    setAddFormOpen(false);
  };

  const handleStatusChange = (taskId, status) => {
    // ของจริง: fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'updateStatus', taskId, status }) })
    setTasks(tasks.map((t) => (t.taskId === taskId ? { ...t, status } : t)));
  };

  const handleAssigneeChange = (taskId, assignees) => {
    // ของจริง: fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'update', taskId, assignees }) })
    setTasks(tasks.map((t) => (t.taskId === taskId ? { ...t, assignees } : t)));
  };

  const handleUpdateTask = (taskId, updates) => {
    // ของจริง: fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'update', taskId, ...updates }) })
    setTasks(tasks.map((t) => (t.taskId === taskId ? { ...t, ...updates } : t)));
  };

  const handleDelete = (taskId) => {
    // ของจริง: fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', taskId }) })
    if (!window.confirm("ลบงานนี้เลยไหม?")) return;
    setTasks(tasks.filter((t) => t.taskId !== taskId));
  };

  const toggleNewAssignee = (name) => {
    setNewAssignees((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  // ===== จัดการรายชื่อพนักงาน — แก้ไข/เพิ่ม/ลบ =====
  const renameEmployee = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setEmployees((prev) => prev.map((e) => (e === oldName ? trimmed : e)));
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        assignees: (t.assignees || []).map((a) => (a === oldName ? trimmed : a)),
      }))
    );
    if (filterEmployee === oldName) setFilterEmployee(trimmed);
  };

  const addEmployee = () => {
    const trimmed = newEmployeeName.trim();
    if (!trimmed || employees.includes(trimmed)) return;
    setEmployees((prev) => [...prev, trimmed]);
    setNewEmployeeName("");
  };

  const removeEmployee = (name) => {
    setEmployees((prev) => prev.filter((e) => e !== name));
    setTasks((prev) => prev.map((t) => ({ ...t, assignees: (t.assignees || []).filter((a) => a !== name) })));
    if (filterEmployee === name) setFilterEmployee("ทั้งหมด");
  };

  const filtered = filterEmployee === "ทั้งหมด" ? tasks : tasks.filter((t) => (t.assignees || []).includes(filterEmployee));
  const overdueCount = tasks.filter((t) => isTaskOverdue(t.dueDate, t.status)).length;

  // แต่ละคอลัมน์ใช้ filter ต่างกัน — "เลยกำหนด" คำนวณจากวันที่ ไม่ใช่ค่าที่ตั้งเอง
  const getColumnTasks = (column) => {
    if (column === "เลยกำหนด") return filtered.filter((t) => t.status === "ให้งานแล้ว" && isTaskOverdue(t.dueDate, t.status));
    if (column === "ให้งานแล้ว") return filtered.filter((t) => t.status === "ให้งานแล้ว" && !isTaskOverdue(t.dueDate, t.status));
    return filtered.filter((t) => t.status === column);
  };

  return (
    <div className="wrap" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <button
          onClick={onBack}
          className="tap"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#FFFFFF",
            border: "1px solid #ECE9E1",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={18} color={GOLD_DARK} />
        </button>
        <div style={{ fontWeight: 700, fontSize: 18, flex: 1 }}>Task Tracker</div>
        {overdueCount > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#DC2626", fontWeight: 700, background: "#DC262614", padding: "5px 11px", borderRadius: 20 }}>
            <AlertCircle size={13} /> {overdueCount} เกินกำหนด
          </span>
        )}
      </div>

      {/* ปุ่มเดียว "+ เพิ่มงาน" — กดแล้วค่อยกางฟอร์มกรอกชื่องาน + มอบหมาย */}
      {!addFormOpen ? (
        <button
          onClick={() => setAddFormOpen(true)}
          className="tap"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            background: GOLD_DARK,
            color: "#FFFFFF",
            border: "none",
            borderRadius: 14,
            padding: "12px 0",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          <Plus size={16} /> เพิ่มงาน
        </button>
      ) : (
        <div style={{ background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>เพิ่มงาน</div>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="พิมพ์ชื่องาน..."
            autoFocus
            style={{ width: "100%", fontSize: 13.5, padding: "10px 14px", border: "1px solid #ECE9E1", borderRadius: 12, outline: "none", fontFamily: "inherit", marginBottom: 10 }}
          />

          {/* เลือกผู้รับมอบหมาย — เลือกได้หลายคน หรือกด "ทุกคน" */}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <button
              onClick={() => setNewPickerOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                padding: "9px 14px",
                width: "100%",
                border: "1px solid #ECE9E1",
                borderRadius: 12,
                outline: "none",
                fontFamily: "inherit",
                background: "#FAFAF8",
                color: newAssignees.length ? "#111318" : "#9CA3AF",
                cursor: "pointer",
              }}
            >
              {newAssignees.length === 0 ? "มอบหมายให้..." : newAssignees.length === 1 ? newAssignees[0] : `${newAssignees.length} คน`}
            </button>
            {newPickerOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 30 }} onClick={() => setNewPickerOpen(false)} />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 31,
                    background: "#FFFFFF",
                    border: "1px solid #ECE9E1",
                    borderRadius: 14,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    padding: 10,
                  }}
                >
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <button
                      onClick={() => setNewAssignees(employees)}
                      style={{ flex: 1, fontSize: 10.5, fontWeight: 700, color: GOLD_DARK, background: `${GOLD}1A`, border: "none", borderRadius: 8, padding: "5px 0", cursor: "pointer" }}
                    >
                      ทุกคน
                    </button>
                    <button
                      onClick={() => setNewAssignees([])}
                      style={{ flex: 1, fontSize: 10.5, fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", border: "none", borderRadius: 8, padding: "5px 0", cursor: "pointer" }}
                    >
                      ล้าง
                    </button>
                  </div>
                  <div style={{ maxHeight: 180, overflowY: "auto" }}>
                    {employees.map((name) => {
                      const checked = newAssignees.includes(name);
                      return (
                        <label key={name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 4px", cursor: "pointer", borderRadius: 6 }}>
                          <input type="checkbox" checked={checked} onChange={() => toggleNewAssignee(name)} style={{ accentColor: GOLD_DARK }} />
                          <span style={{ fontSize: 12, fontWeight: checked ? 700 : 500, color: checked ? "#111318" : "#6B7280" }}>{name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* กำหนดส่ง — วันที่ + เวลา */}
          <input
            type="datetime-local"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            style={{ width: "100%", fontSize: 13, padding: "9px 14px", border: "1px solid #ECE9E1", borderRadius: 12, outline: "none", fontFamily: "inherit", background: "#FAFAF8", marginBottom: 10 }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                setAddFormOpen(false);
                setNewTitle("");
                setNewAssignees([]);
                setNewDueDate(defaultDueDateTime());
              }}
              style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", border: "none", borderRadius: 12, padding: "10px 0", cursor: "pointer" }}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleAdd}
              style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#FFFFFF", background: GOLD_DARK, border: "none", borderRadius: 12, padding: "10px 0", cursor: "pointer" }}
            >
              บันทึก
            </button>
          </div>
        </div>
      )}

      {/* จัดการรายชื่อพนักงาน — แก้ไข/เพิ่ม/ลบ */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setManageEmployeesOpen((v) => !v)}
          style={{ fontSize: 11.5, fontWeight: 600, color: GOLD_DARK, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
        >
          <Pencil size={12} /> {manageEmployeesOpen ? "ปิดจัดการพนักงาน" : "จัดการรายชื่อพนักงาน"}
        </button>
        {manageEmployeesOpen && (
          <div style={{ marginTop: 8, background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 14, padding: 12 }}>
            {employees.map((name) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input
                  defaultValue={name}
                  onBlur={(e) => renameEmployee(name, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                  style={{ flex: 1, fontSize: 12.5, padding: "6px 10px", border: "1px solid #ECE9E1", borderRadius: 8, fontFamily: "inherit" }}
                />
                <button
                  onClick={() => removeEmployee(name)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", padding: 4 }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <input
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEmployee()}
                placeholder="เพิ่มชื่อพนักงานใหม่..."
                style={{ flex: 1, fontSize: 12.5, padding: "6px 10px", border: "1px solid #ECE9E1", borderRadius: 8, fontFamily: "inherit" }}
              />
              <button
                onClick={addEmployee}
                style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", background: GOLD_DARK, border: "none", borderRadius: 8, padding: "0 14px", cursor: "pointer" }}
              >
                เพิ่ม
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        <Filter size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
        {["ทั้งหมด", ...employees].map((name) => (
          <button
            key={name}
            onClick={() => setFilterEmployee(name)}
            style={{
              flexShrink: 0,
              fontSize: 11.5,
              padding: "6px 13px",
              borderRadius: 20,
              border: filterEmployee === name ? `1px solid ${GOLD_DARK}` : "1px solid #ECE9E1",
              background: filterEmployee === name ? GOLD_DARK : "#FFFFFF",
              color: filterEmployee === name ? "#FFFFFF" : "#9CA3AF",
              fontWeight: filterEmployee === name ? 700 : 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="kanbanGrid">
        {KANBAN_COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column);
          const s = STATUS_STYLE[column];
          const isOpen = !!openColumns[column];
          return (
            <div key={column} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 18, padding: 12 }}>
              <button
                onClick={() => setOpenColumns((prev) => ({ ...prev, [column]: !prev[column] }))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 2px",
                  marginBottom: isOpen ? 12 : 0,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{column}</span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: s.text,
                    background: "#FFFFFF",
                    padding: "2px 8px",
                    borderRadius: 20,
                    marginLeft: "auto",
                  }}
                >
                  {columnTasks.length} งาน
                </span>
                <ChevronLeft
                  size={14}
                  color={s.text}
                  style={{ transform: isOpen ? "rotate(90deg)" : "rotate(-90deg)", transition: "transform 0.15s ease", flexShrink: 0 }}
                />
              </button>
              {isOpen &&
                (columnTasks.length === 0 ? (
                  <div style={{ fontSize: 11.5, color: "#B8B4AE", padding: "28px 0", textAlign: "center" }}>ไม่มีงาน</div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.taskId}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onAssigneeChange={handleAssigneeChange}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDelete}
                      employees={employees}
                    />
                  ))
                ))}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 10.5, color: "#9CA3AF", textAlign: "center", marginTop: 24 }}>
        * ตอนนี้ยังเก็บข้อมูลชั่วคราว (mock) — รอต่อกับ Google Sheet ผ่าน Apps Script Web App
      </div>
    </div>
  );
}

// หน้าด่านรหัสผ่าน — เข้าไม่ได้จนกว่าจะกรอกรหัสถูก
function LoginGate({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === OWNER_PASSWORD) {
      localStorage.setItem(OWNER_AUTH_KEY, "true");
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F6F3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'Inter','Noto Sans Thai',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');`}</style>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#FFFFFF",
          border: "1px solid #ECE9E1",
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(120deg, #1A1712 0%, ${GOLD_DARK} 55%, ${GOLD} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Lock size={22} color="#FFFFFF" />
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Owner Console</div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>กรอกรหัสผ่านเพื่อเข้าใช้งาน</div>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          autoFocus
          placeholder="รหัสผ่าน"
          style={{
            width: "100%",
            fontSize: 14,
            padding: "12px 14px",
            border: `1px solid ${error ? "#DC2626" : "#ECE9E1"}`,
            borderRadius: 12,
            outline: "none",
            fontFamily: "inherit",
            textAlign: "center",
            marginBottom: error ? 8 : 16,
          }}
        />
        {error && <div style={{ fontSize: 11.5, color: "#DC2626", marginBottom: 12 }}>รหัสผ่านไม่ถูกต้อง</div>}
        <button
          type="submit"
          style={{
            width: "100%",
            background: GOLD_DARK,
            color: "#FFFFFF",
            border: "none",
            borderRadius: 12,
            padding: "12px 0",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}

export default function OpsHubOwnerConsole() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(OWNER_AUTH_KEY) === "true");
  const [activeCategory, setActiveCategory] = useState(null);
  const [page, setPage] = useState("dashboard"); // "dashboard" | "tasks"
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [employeeSales, setEmployeeSales] = useState([]);
  const [employeeSalesLoading, setEmployeeSalesLoading] = useState(true);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [todaySales, setTodaySales] = useState({ mb: 0, pt: 0, club: 0 });
  const [todaySalesLoading, setTodaySalesLoading] = useState(true);
  const [monthSales, setMonthSales] = useState({ mb: 0, pt: 0, club: 0 });
  const [monthSalesLoading, setMonthSalesLoading] = useState(true);
  const [memberPackages, setMemberPackages] = useState({
    mb: { newCount: 0, renewCount: 0, otherCount: 0 },
    pt: { newCount: 0, renewCount: 0, otherCount: 0 },
  });
  const [memberPackagesLoading, setMemberPackagesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchTodaySales();
        if (!cancelled) setTodaySales(result);
      } catch (e) {
        console.error("โหลดยอดขายวันนี้ไม่สำเร็จ", e);
      } finally {
        if (!cancelled) setTodaySalesLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchMonthSales();
        if (!cancelled) setMonthSales(result);
      } catch (e) {
        console.error("โหลดยอดขายเดือนนี้ไม่สำเร็จ", e);
      } finally {
        if (!cancelled) setMonthSalesLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchMemberPackages();
        if (!cancelled) setMemberPackages(result);
      } catch (e) {
        console.error("โหลดข้อมูลสมาชิกซื้อแพ็กเกจไม่สำเร็จ", e);
      } finally {
        if (!cancelled) setMemberPackagesLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAttendance() {
      try {
        const list = await fetchTodayAttendance();
        if (!cancelled) setAttendanceToday(list);
      } catch (e) {
        console.error("โหลดรายการเข้างานวันนี้ไม่สำเร็จ", e);
      } finally {
        if (!cancelled) setAttendanceLoading(false);
      }
    }
    loadAttendance();
    const interval = setInterval(loadAttendance, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadEmployeeSales() {
      try {
        const list = await fetchEmployeeSales();
        if (!cancelled) setEmployeeSales(list);
      } catch (e) {
        console.error("โหลดยอดขายพนักงานไม่สำเร็จ", e);
      } finally {
        if (!cancelled) setEmployeeSalesLoading(false);
      }
    }
    loadEmployeeSales();
    const interval = setInterval(loadEmployeeSales, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!unlocked) {
    return <LoginGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F6F3",
        color: "#111318",
        fontFamily: "'Inter','Noto Sans Thai',sans-serif",
        paddingBottom: 48,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .tap { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .tap:active { transform: scale(0.97); }

        .wrap { max-width: 1040px; margin: 0 auto; padding: 0 20px; }
        .headerInner { padding: 12px 0; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 10px; }
        .avatar { width: 32px; height: 32px; flex-shrink: 0; }
        .titleBrand { font-size: 10px; }
        .titleMain { font-size: 13px; }
        .sectionTitle { font-size: 14px; }
        .sectionIcon { width: 15px; height: 15px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .attendanceGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .attendanceChip { display: flex; align-items: baseline; justify-content: center; gap: 5px; background: #FFFFFF; border: 1px solid #ECE9E1; border-radius: 10px; padding: 8px 6px; min-width: 0; }
        .iconCard { padding: 14px 8px 12px; }
        .iconCardIcon { width: 38px; height: 38px; }
        .kanbanGrid { display: grid; grid-template-columns: 1fr; gap: 16px; }

        @media (min-width: 640px) {
          .avatar { width: 40px; height: 40px; }
          .titleBrand { font-size: 12px; }
          .titleMain { font-size: 16px; }
        }

        @media (min-width: 720px) {
          .headerInner { padding: 16px 0; gap: 16px; }
          .avatar { width: 42px; height: 42px; }
          .titleMain { font-size: 17px; }
          .sectionTitle { font-size: 17px; }
          .sectionIcon { width: 18px; height: 18px; }
          .grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 16px; }
          .attendanceGrid { grid-template-columns: repeat(6, 1fr); gap: 10px; }
          .attendanceChip { padding: 10px 8px; }
          .iconCard { padding: 26px 16px 20px; }
          .iconCardIcon { width: 56px; height: 56px; }
          .tap:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
          .wrap { padding: 0 40px; }
          .kanbanGrid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Header (frozen) — สี่เหลี่ยมเต็มแนวนอน ไม่มีขอบมน */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: `linear-gradient(120deg, #1A1712 0%, ${GOLD_DARK} 55%, ${GOLD} 100%)`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        <div className="wrap" style={{ padding: "14px 0 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                className="avatar"
                style={{
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: `2px solid ${GOLD}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                  padding: 3,
                }}
              >
                <img src={GAIN_LOGO} alt="Gain Optima" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <div className="titleBrand" style={{ color: "#EFE2BC", whiteSpace: "nowrap" }}>Gain Optima</div>
                <div
                  className="titleMain"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap" }}
                >
                  Owner Console
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem(OWNER_AUTH_KEY);
                setUnlocked(false);
              }}
              className="tap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#FFFFFF14",
                border: "1px solid #FFFFFF2A",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <LogOut size={14} color="#FFFFFF" />
            </button>
          </div>

          {/* แถวปุ่มลัด — Task Tracker + Gymmo Console เรียงเต็มแนวนอน */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => setPage("tasks")}
              className="tap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                flex: 1,
                background: "#FFFFFF14",
                border: "1px solid #FFFFFF2A",
                borderRadius: 12,
                padding: "9px 10px",
                cursor: "pointer",
              }}
            >
              <ListChecks size={14} color="#FFFFFF" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap" }}>Task Tracker</span>
            </button>

            <a
              href="https://console.gymmo.app/th"
              className="tap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                flex: 1,
                textDecoration: "none",
                background: "#FFFFFF",
                borderRadius: 12,
                padding: "6px 10px",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "1px solid #ECE9E1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                  padding: 2,
                }}
              >
                <img src={GYMMO_LOGO} alt="Gymmo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#111318", whiteSpace: "nowrap" }}>Gymmo Console</span>
            </a>
          </div>
        </div>
      </div>

      {page === "tasks" ? (
        <TaskTrackerPage onBack={() => setPage("dashboard")} />
      ) : (
        <>
      {/* ยอดขาย — เดือนนี้ (หลัก) + วันนี้ (รอง) ต่อการ์ด + รายละเอียดรายคน */}
      <div className="wrap" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="sectionTitle" style={{ fontWeight: 700 }}>ยอดขาย</div>
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>เดือนนี้ / วันนี้</div>
        </div>

        {monthSalesLoading ? (
          <div style={{ padding: 16, fontSize: 12.5, color: "#9CA3AF", background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16 }}>
            กำลังโหลด…
          </div>
        ) : (
          <>
            {(() => {
              const summaryCards = [
                { label: "คลับรวม", month: monthSales.club, today: todaySales.club },
                { label: "MB", month: monthSales.mb, today: todaySales.mb },
                { label: "PT", month: monthSales.pt, today: todaySales.pt },
              ];
              return (
                <div className="grid" style={{ marginBottom: 12 }}>
                  {summaryCards.map((c) => (
                    <div
                      key={c.label}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #ECE9E1",
                        borderRadius: 16,
                        padding: "14px 12px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 6 }}>{c.label}</div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          fontFamily: "'Space Grotesk', sans-serif",
                          color: GOLD_DARK,
                        }}
                      >
                        {fmtBaht(c.month)}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: c.today > 0 ? "#16A34A" : "#9CA3AF",
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: "1px solid #F0EEE8",
                        }}
                      >
                        {todaySalesLoading ? "…" : fmtBaht(c.today)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <button
              onClick={() => setShowEmployeeDetail((v) => !v)}
              className="tap"
              style={{
                width: "100%",
                background: "#FFFFFF",
                border: "1px solid #ECE9E1",
                borderRadius: 14,
                padding: "10px 16px",
                fontSize: 12.5,
                fontWeight: 600,
                color: GOLD_DARK,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {showEmployeeDetail ? "ซ่อนรายละเอียดพนักงาน ▲" : "ดูรายละเอียดพนักงาน ▼"}
            </button>
            {showEmployeeDetail && (
              <div style={{ marginTop: 10, background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16, overflow: "hidden" }}>
                {employeeSales.length === 0 ? (
                  <div style={{ padding: 16, fontSize: 12.5, color: "#9CA3AF" }}>ยังไม่มีข้อมูลยอดขาย</div>
                ) : (
                  employeeSales.map((row, i) => {
                    const rank = i + 1;
                    const total = (row.mb || 0) + (row.pt || 0);
                    const medal =
                      rank === 1
                        ? { bg: "#FFF6DC", border: "#D4AF37", text: "#8A6D1D", label: "🥇" }
                        : rank === 2
                        ? { bg: "#F4F4F5", border: "#B0B3B8", text: "#5E6166", label: "🥈" }
                        : rank === 3
                        ? { bg: "#FBEEE3", border: "#C97F3C", text: "#8A501E", label: "🥉" }
                        : null;
                    return (
                      <div
                        key={row.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderTop: i === 0 ? "none" : "1px solid #F0EEE8",
                          background: medal ? medal.bg : "transparent",
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            background: medal ? "#FFFFFF" : "#F5F5F3",
                            border: medal ? `1.5px solid ${medal.border}` : "1px solid #ECE9E1",
                            fontSize: medal ? 15 : 12.5,
                            fontWeight: 700,
                            color: medal ? medal.text : "#9CA3AF",
                          }}
                        >
                          {medal ? medal.label : rank}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: medal ? 700 : 600, color: medal ? medal.text : "#111318" }}>
                            {row.name}
                          </div>
                          <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 1 }}>
                            MB {fmtBaht(row.mb)} · รวม {fmtBaht(total)}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: medal ? medal.text : "#111318",
                            flexShrink: 0,
                          }}
                        >
                          {fmtBaht(row.pt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* เป้าหมายเดือนนี้ — ยอดขายรวม + เป้า PT (เป้าหมายตั้งค่าไว้คงที่ ปรับตัวเลขได้ตามจริง) */}
      <div className="wrap" style={{ marginTop: 20 }}>
        <div className="sectionTitle" style={{ fontWeight: 700, marginBottom: 10 }}>เป้าหมายเดือนนี้</div>
        {monthSalesLoading ? (
          <div style={{ padding: 16, fontSize: 12.5, color: "#9CA3AF", background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16 }}>
            กำลังโหลด…
          </div>
        ) : (
          (() => {
            const totalClub = monthSales.club;
            const totalPT = monthSales.pt;
            const CLUB_TARGET = 1000000;
            const PT_TARGET = 480000;
            const clubPct = Math.min(100, Math.round((totalClub / CLUB_TARGET) * 100));
            const ptPct = Math.min(100, Math.round((totalPT / PT_TARGET) * 100));
            return (
              <div style={{ background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Target size={14} color={GOLD_DARK} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>ยอดขายรวม</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                    <b style={{ color: GOLD_DARK, fontFamily: "'Space Grotesk', sans-serif" }}>{fmtBaht(totalClub)}</b> / {fmtBaht(CLUB_TARGET)}
                  </span>
                </div>
                <div style={{ height: 10, background: "#F0EEE8", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${clubPct}%`, height: "100%", background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD})`, borderRadius: 6 }} />
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
                  ทำได้แล้ว {clubPct}% ของเป้า · เหลืออีก {fmtBaht(Math.max(0, CLUB_TARGET - totalClub))}
                </div>

                <div style={{ height: 1, background: "#F0EEE8", margin: "16px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Target size={14} color={GOLD_DARK} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>เป้าหมาย PT</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                    <b style={{ color: GOLD_DARK, fontFamily: "'Space Grotesk', sans-serif" }}>{fmtBaht(totalPT)}</b> / {fmtBaht(PT_TARGET)}
                  </span>
                </div>
                <div style={{ height: 10, background: "#F0EEE8", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${ptPct}%`, height: "100%", background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD})`, borderRadius: 6 }} />
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
                  ทำได้แล้ว {ptPct}% ของเป้า PT · เหลืออีก {fmtBaht(Math.max(0, PT_TARGET - totalPT))}
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* สมาชิกซื้อแพ็กเกจเดือนนี้ — แยก New/Renew ต่อ MB และ PT (real-time จาก DATA tab) */}
      <div className="wrap" style={{ marginTop: 20 }}>
        <div className="sectionTitle" style={{ fontWeight: 700, marginBottom: 10 }}>สมาชิกซื้อแพ็กเกจเดือนนี้</div>
        {memberPackagesLoading ? (
          <div style={{ padding: 16, fontSize: 12.5, color: "#9CA3AF", background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16 }}>
            กำลังโหลด…
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16, padding: "14px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: `${GOLD}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <UserPlus size={13} color={GOLD_DARK} />
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>MB</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>สมัครใหม่</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#16A34A" }}>
                    {memberPackages.mb.newCount}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>ต่ออายุ</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {memberPackages.mb.renewCount}
                  </span>
                </div>
              </div>
              <div style={{ background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16, padding: "14px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: `${GOLD}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Dumbbell size={13} color={GOLD_DARK} />
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>PT</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>สมัครใหม่</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#16A34A" }}>
                    {memberPackages.pt.newCount}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>ต่ออายุ</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {memberPackages.pt.renewCount}
                  </span>
                </div>
              </div>
            </div>
            {memberPackages.mb.otherCount > 0 && (
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 8 }}>
                * MB มี {memberPackages.mb.otherCount} รายการที่ยังไม่ระบุ New/Renew (ฟอร์ม MB ยังไม่มีฟิลด์นี้ หรือยังไม่ได้ส่งไป Sheet) — ตัวเลขด้านบนอาจไม่ครบ
              </div>
            )}
            {memberPackages.pt.otherCount > 0 && (
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>
                * PT มี {memberPackages.pt.otherCount} รายการที่ยังไม่ระบุ New/Renew (ข้อมูลเก่าก่อนแก้ script) — ตัวเลขด้านบนอาจไม่ครบ
              </div>
            )}
          </>
        )}
      </div>

      {/* การเข้างานวันนี้ — อยู่ใต้เป้าหมายเดือนนี้ */}
      <div className="wrap" style={{ marginTop: 20 }}>
        <div className="sectionTitle" style={{ fontWeight: 700, marginBottom: 10 }}>
          การเข้างานวันที่ {fmtThaiDate(new Date())}
        </div>
        {attendanceLoading ? (
          <div style={{ padding: 16, fontSize: 12.5, color: "#9CA3AF", background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16 }}>
            กำลังโหลด…
          </div>
        ) : attendanceToday.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12.5, color: "#9CA3AF", background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16 }}>
            ยังไม่มีใครเช็คอินวันนี้
          </div>
        ) : (
          <div className="attendanceGrid">
            {attendanceToday.map((row, i) => (
              <div key={i} className="attendanceChip">
                <span style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.name}
                </span>
                <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
                  {fmtTime(row.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="wrap">
        {activeCategory === null ? (
          <>
            {/* หน้าแรก: การ์ดหมวดหมู่ — ไอคอน + ชื่อ + คำอธิบายสั้นๆ */}
            <div style={{ marginTop: 32 }}>
              <div className="grid">
                {categories.map((cat) => (
                  <IconCard
                    key={cat.id}
                    icon={cat.icon}
                    label={cat.label}
                    description={cat.description}
                    onClick={() => setActiveCategory(cat.id)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* หลังคลิกหมวด: การ์ดลิงก์แต่ละอัน — ไอคอน + ชื่อ + คำอธิบายสั้นๆ */}
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => setActiveCategory(null)}
                className="tap"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "1px solid #ECE9E1",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={18} color={GOLD_DARK} />
              </button>
              <div className="sectionTitle" style={{ fontWeight: 700 }}>
                {categories.find((c) => c.id === activeCategory)?.label}
              </div>
            </div>
            <div className="grid" style={{ marginTop: 16 }}>
              {categories
                .find((c) => c.id === activeCategory)
                ?.items.map((item) => (
                  <IconCard key={item.label} icon={item.icon} label={item.label} description={item.description} href={item.href} />
                ))}
            </div>
          </>
        )}
      </div>
        </>
      )}
    </div>
  );
}

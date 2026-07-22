import React, { useEffect, useState } from "react";
import {
  Dumbbell,
  TrendingUp,
  FileText,
  UserPlus,
  Wallet,
  ClipboardList,
  Receipt,
  FileSignature,
  CalendarDays,
  FileSpreadsheet,
  GraduationCap,
  ChevronLeft,
  Megaphone,
  Tag,
  Image,
  ListChecks,
  Clock,
  AlertCircle,
} from "lucide-react";

const GOLD = "#C9A227";
const GOLD_DARK = "#7A5E12";

const REVENUE_SHEET_ID = "11JY-u1njafkk_zIQSX4N-FQIRvvXGoTwR9MWkNkT3s4";

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

// Leaderboard ยอดขาย PT ของเดือนนี้ — เรียงจากมากไปน้อย
async function fetchPTLeaderboard() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const rows = await gvizQuery(`SELECT K, SUM(I) WHERE E = 'PT' AND C = ${month} AND D = ${year} GROUP BY K`);
  return rows
    .filter((r) => r.label)
    .map((r) => ({ name: r.label, total: r.value }))
    .sort((a, b) => b.total - a.total);
}

const GYMMO_LOGO =
  "data:image/png;base64,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";

// "ที่ใช้บ่อย" — แสดงตรงหน้าแรกเลย ไม่ต้องคลิกเข้าหมวด
const frequentItems = [
  {
    label: "คำนวณค่าคอม_PT",
    description: "คอมมิชชั่น PT ต่อลูกค้า",
    icon: TrendingUp,
    href: "https://docs.google.com/spreadsheets/d/1cI4VGPDGgv1vvqWy2Rrtv7fTbBygAi_l9eaAl78M8hs/edit",
  },
  {
    label: "ตารางงาน",
    description: "ตารางเวรพนักงาน",
    icon: CalendarDays,
    href: "https://docs.google.com/spreadsheets/d/1pS7S_LH7gjZ7wgWspvXSAZO9llpQVMa9TEbq3GnGvTo/edit?gid=161842714#gid=161842714",
  },
  {
    label: "เช็คชื่อครูคลาส",
    description: "เช็คชื่อเข้างานครูคลาส",
    icon: GraduationCap,
    href: "https://docs.google.com/spreadsheets/d/1fFn0k39tzL2sqPLRfkLH6YTkkk-8hGA-QoVu8GB4EW8/edit?gid=0#gid=0",
  },
];

// หมวดอื่นๆ — เก็บลิงก์ที่ไม่ได้ใช้บ่อยและไม่เข้าหมวดไหนชัดเจน
const otherCategory = {
  id: "other",
  label: "หมวดอื่นๆ",
  description: "ชีทกลางและอื่นๆ",
  icon: FileSpreadsheet,
  items: [
    {
      label: "ชีทกลาง",
      description: "ชีทกลางของทีม",
      icon: FileSpreadsheet,
      href: "https://docs.google.com/spreadsheets/d/1F1ctMoOktC04b_8kZN-XO68FJYrUWZXQ2UyT--E5uMw/edit?gid=93537741#gid=93537741",
    },
  ],
};

// หมวดหมู่ที่ต้องคลิกเข้าไปดูก่อนถึงจะเห็นลิงก์ (แบบ Owner Console)
const categories = [
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
      {
        label: "รายการเบิกเงิน",
        description: "สรุปรายการเบิกเงินทั้งหมด",
        icon: Receipt,
        href: "https://docs.google.com/spreadsheets/u/1/d/1VilTSeJGCDTw6mnEbZGVw9GPjbXwPNTKinElossaEPc/htmlview",
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
    id: "marketing",
    label: "การตลาด",
    description: "ราคาแพ็กเกจ + คลัง Media",
    icon: Megaphone,
    items: [
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
  otherCategory,
];

// การ์ดแบบเดียวกันทั้งหมด — ไอคอนบน + ชื่อ + คำอธิบายสั้นๆ, เปิดลิงก์แท็บใหม่เสมอ
function IconCard({ icon: Icon, label, description, onClick, href, highlight }) {
  const content = (
    <>
      <div
        className="iconCardIcon"
        style={{
          borderRadius: 14,
          background: highlight ? `${GOLD}33` : `${GOLD}1A`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={22} color={GOLD_DARK} />
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>{label}</div>
      {description && (
        <div style={{ fontSize: 10.5, color: "#9CA3AF", textAlign: "center", lineHeight: 1.3 }}>{description}</div>
      )}
    </>
  );

  const style = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    color: "#111318",
    background: highlight ? `${GOLD}14` : "#FFFFFF",
    border: highlight ? `1.5px solid ${GOLD}66` : "1px solid #ECE9E1",
    borderRadius: 18,
    boxShadow: highlight ? "0 2px 8px rgba(201,162,39,0.15)" : "0 1px 3px rgba(0,0,0,0.03)",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="tap iconCard" style={style}>
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

// ===== Task Tracker (staff) — อัปเดตสถานะได้อย่างเดียว ห้ามแก้/ลบ/มอบหมายใหม่ =====
// ใช้ Google Sheet เดียวกับ Owner Console ผ่าน Apps Script Web App เดียวกัน (WEB_APP_URL)
const TASK_STATUSES = ["ต้องทำ", "กำลังทำ", "เสร็จแล้ว"];
const TASK_EMPLOYEES = ["ทั้งหมด", "ต้า", "Copter", "เมล", "เพชร", "ดีม", "เกม", "เป้", "จีจี้"];
const STATUS_STYLE = {
  ต้องทำ: { bg: "#FEF8E9", border: "#F3E3B0", text: "#B7791F", dot: "#D69E2E" },
  กำลังทำ: { bg: "#F2EFFB", border: "#DCD3F5", text: "#6B46C1", dot: "#8B5CF6" },
  เสร็จแล้ว: { bg: "#EAF7EE", border: "#C6E9CF", text: "#15803D", dot: "#22C55E" },
};
const TASK_CATEGORY_COLORS = {
  ซ่อมบำรุง: { bg: "#FEE2E2", text: "#B91C1C" },
  ทั่วไป: { bg: "#F3F4F6", text: "#4B5563" },
  การตลาด: { bg: "#EDE9FE", text: "#6D28D9" },
  ความสะอาด: { bg: "#DBEAFE", text: "#1D4ED8" },
  เอกสาร: { bg: "#FCE7F3", text: "#BE185D" },
};
const TASK_CATEGORY_DEFAULT = { bg: `${GOLD}1A`, text: GOLD_DARK };

// mock data — เดียวกับฝั่ง Owner (พอต่อ Web App จริงจะดึงจาก Sheet เดียวกันทั้งคู่)
const MOCK_TASKS = [
  { taskId: "T1", title: "ซ่อมลู่วิ่งตัวที่ 3", category: "ซ่อมบำรุง", assignees: ["ต้า"], status: "ต้องทำ", dueDate: "2026-07-20" },
  { taskId: "T2", title: "สั่งซื้อผ้าเช็ดตัวเพิ่ม", category: "ทั่วไป", assignees: ["เมล"], status: "ต้องทำ", dueDate: "2026-07-25" },
  { taskId: "T3", title: "อัปเดตราคาแพ็กเกจในเพจ", category: "การตลาด", assignees: ["จีจี้", "เมล"], status: "กำลังทำ", dueDate: "2026-07-22" },
  { taskId: "T4", title: "ทำความสะอาดเครื่องปรับอากาศ", category: "ความสะอาด", assignees: ["เกม"], status: "กำลังทำ", dueDate: "2026-07-18" },
  { taskId: "T5", title: "เตรียมเอกสารต่อสัญญาเช่า", category: "เอกสาร", assignees: ["ต้า"], status: "เสร็จแล้ว", dueDate: "2026-07-15" },
];

function isTaskOverdue(dueDate, status) {
  if (status === "เสร็จแล้ว") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function fmtTaskDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

// การ์ดฝั่ง Staff — เห็นข้อมูลครบ แต่แก้ได้แค่สถานะเท่านั้น (ไม่มีดินสอ, ไม่มีปุ่มลบ, ไม่มีตัวเลือก assignee)
function StaffTaskCard({ task, onStatusChange }) {
  const overdue = isTaskOverdue(task.dueDate, task.status);
  const catColor = TASK_CATEGORY_COLORS[task.category] || TASK_CATEGORY_DEFAULT;
  const assignees = task.assignees || [];
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "14px 14px 12px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, color: "#111318" }}>{task.title}</div>

      <div style={{ marginTop: 8 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: catColor.text, background: catColor.bg, padding: "3px 9px", borderRadius: 8 }}>
          {task.category}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
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
        {/* แสดงคนที่ถูกมอบหมาย — ดูอย่างเดียว แก้ไม่ได้ */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {assignees.length === 0 ? (
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>ไม่ระบุ</span>
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
        </div>
      </div>

      {/* สิทธิ์เดียวที่พนักงานทำได้ — เปลี่ยนสถานะ */}
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
                padding: "6px 0",
                borderRadius: 7,
                border: "none",
                background: active ? "#11131812" : "#FAFAF8",
                color: active ? "#111318" : "#9CA3AF",
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

function StaffTaskTrackerPage({ onBack }) {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filterEmployee, setFilterEmployee] = useState("ทั้งหมด");

  const handleStatusChange = (taskId, status) => {
    // ของจริง: fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'updateStatus', taskId, status }) })
    // ใช้ Web App เดียวกับฝั่ง Owner — แก้ได้แค่ status เท่านั้น ไม่มี action อื่นให้เรียกใช้ฝั่งนี้
    setTasks(tasks.map((t) => (t.taskId === taskId ? { ...t, status } : t)));
  };

  const filtered = filterEmployee === "ทั้งหมด" ? tasks : tasks.filter((t) => (t.assignees || []).includes(filterEmployee));

  return (
    <div className="wrap" style={{ marginTop: 24 }}>
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
        <div style={{ fontWeight: 700, fontSize: 18 }}>Task Tracker</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, overflowX: "auto", paddingBottom: 2 }}>
        {TASK_EMPLOYEES.map((name) => (
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
        {TASK_STATUSES.map((status) => {
          const columnTasks = filtered.filter((t) => t.status === status);
          const s = STATUS_STYLE[status];
          return (
            <div key={status} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 18, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 2px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{status}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: s.text, background: "#FFFFFF", padding: "2px 8px", borderRadius: 20, marginLeft: "auto" }}>
                  {columnTasks.length}
                </span>
              </div>
              {columnTasks.length === 0 ? (
                <div style={{ fontSize: 11.5, color: "#B8B4AE", padding: "28px 0", textAlign: "center" }}>ไม่มีงาน</div>
              ) : (
                columnTasks.map((task) => <StaffTaskCard key={task.taskId} task={task} onStatusChange={handleStatusChange} />)
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 10.5, color: "#9CA3AF", textAlign: "center", marginTop: 24 }}>
        * อัปเดตได้แค่สถานะงาน — เพิ่ม/แก้ไข/มอบหมายงานทำได้จาก Owner Console เท่านั้น
      </div>
    </div>
  );
}

export default function OpsHubStaffResponsive() {
  const [clubSales, setClubSales] = useState(null);
  const [ptSales, setPtSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [page, setPage] = useState("home"); // "home" | "tasks"
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [club, pt] = await Promise.all([fetchCell("A5"), fetchCell("C7")]);
        if (!cancelled) {
          setClubSales(club);
          setPtSales(pt);
        }
      } catch (e) {
        console.error("โหลดยอดขาย real-time ไม่สำเร็จ", e);
      } finally {
        if (!cancelled) setLoading(false);
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
    async function loadLeaderboard() {
      try {
        const list = await fetchPTLeaderboard();
        if (!cancelled) setLeaderboard(list);
      } catch (e) {
        console.error("โหลด leaderboard ไม่สำเร็จ", e);
      } finally {
        if (!cancelled) setLeaderboardLoading(false);
      }
    }
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

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
        .headerInner { padding: 12px 0; display: flex; align-items: center; justify-content: center; flex-wrap: nowrap; gap: 24px; }
        .avatar { width: 32px; height: 32px; flex-shrink: 0; }
        .titleBrand { font-size: 10px; }
        .titleMain { font-size: 13px; }
        .sectionTitle { font-size: 14px; }
        .sectionIcon { width: 15px; height: 15px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .frequentGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .iconCard { padding: 20px 12px 16px; }
        .iconCardIcon { width: 48px; height: 48px; }
        .dashRow { display: flex; gap: 8px; flex-shrink: 1; min-width: 0; }
        .dashCard { padding: 8px 12px; min-width: 0; }
        .dashLabel { font-size: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dashValue { font-size: 13px; white-space: nowrap; }
        .labelFull { display: none; }
        .labelShort { display: inline; }
        .kanbanGrid { display: grid; grid-template-columns: 1fr; gap: 16px; }

        @media (min-width: 640px) {
          .avatar { width: 40px; height: 40px; }
          .titleBrand { font-size: 12px; }
          .titleMain { font-size: 16px; }
          .dashCard { padding: 10px 14px; }
          .dashLabel { font-size: 10px; }
          .dashValue { font-size: 16px; }
          .labelFull { display: inline; }
          .labelShort { display: none; }
        }

        @media (min-width: 720px) {
          .headerInner { padding: 16px 0; gap: 16px; justify-content: space-between; }
          .avatar { width: 42px; height: 42px; }
          .titleMain { font-size: 17px; }
          .sectionTitle { font-size: 17px; }
          .sectionIcon { width: 18px; height: 18px; }
          .grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 16px; }
          .iconCard { padding: 26px 16px 20px; }
          .iconCardIcon { width: 56px; height: 56px; }
          .tap:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
          .wrap { padding: 0 40px; }
          .dashCard { padding: 8px 16px; }
          .kanbanGrid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Header (frozen) + Real-time dashboard */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: `linear-gradient(120deg, #1A1712 0%, ${GOLD_DARK} 55%, ${GOLD} 100%)`,
          borderRadius: "0 0 26px 26px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        <div className="wrap headerInner">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div
              className="avatar"
              style={{
                borderRadius: "50%",
                background: "#FFFFFF18",
                border: `2px solid ${GOLD}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Dumbbell size={16} color="#FFFFFF" />
            </div>
            <div>
              <div className="titleBrand" style={{ color: "#EFE2BC", whiteSpace: "nowrap" }}>Gain Optima</div>
              <div
                className="titleMain"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap" }}
              >
                Staff Hub
              </div>
            </div>
          </div>

          <button
            onClick={() => setPage("tasks")}
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
            <ListChecks size={15} color="#FFFFFF" />
          </button>

          {/* Mini dashboard: ยอดขายคลับ + ยอดขายทีม PT — อยู่แถวเดียวกับหัวข้อ ไม่ตัดบรรทัด */}
          <div className="dashRow">
            <div className="dashCard tap" style={{ background: "#FFFFFF14", border: "1px solid #FFFFFF2A", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", flexShrink: 0 }} />
                <span className="dashLabel" style={{ color: "#EFE2BC", letterSpacing: "0.01em" }}>
                  <span className="labelShort">คลับ</span>
                  <span className="labelFull">ยอดขายคลับ · REAL-TIME</span>
                </span>
              </div>
              <div className="dashValue" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#FFFFFF" }}>
                {loading ? "…" : fmtBaht(clubSales)}
              </div>
            </div>
            <div className="dashCard tap" style={{ background: "#FFFFFF14", border: "1px solid #FFFFFF2A", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", flexShrink: 0 }} />
                <span className="dashLabel" style={{ color: "#EFE2BC", letterSpacing: "0.01em" }}>
                  <span className="labelShort">ทีม PT</span>
                  <span className="labelFull">ยอดขายทีม PT · REAL-TIME</span>
                </span>
              </div>
              <div className="dashValue" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#FFFFFF" }}>
                {loading ? "…" : fmtBaht(ptSales)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {page === "tasks" ? (
        <StaffTaskTrackerPage onBack={() => setPage("home")} />
      ) : (
      <div className="wrap">
        {activeCategory === null ? (
          <>
            {/* Gymmo Console — ลิงก์เดียว กดครั้งเดียวเข้าเลย */}
            <div style={{ marginTop: 24 }}>
              <a
                href="https://console.gymmo.app/th"
                target="_blank"
                rel="noopener noreferrer"
                className="tap"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  textDecoration: "none",
                  color: "#111318",
                  background: "#FFFFFF",
                  border: `1px solid ${GOLD}55`,
                  borderRadius: 20,
                  padding: "16px 18px",
                  boxShadow: "0 4px 14px rgba(201,162,39,0.15)",
                  maxWidth: 460,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "#FFFFFF",
                    border: "1px solid #ECE9E1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  <img src={GYMMO_LOGO} alt="Gymmo" style={{ width: "70%", height: "70%", objectFit: "contain" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: GOLD_DARK, fontWeight: 700, letterSpacing: "0.03em" }}>
                    FITNESS MANAGEMENT
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>Gymmo Console</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>สมาชิก · ธุรกรรม · บิลลิ่ง</div>
                </div>
              </a>
            </div>

            {/* Progression — เป้าหมายคลับ / PT เดือนนี้ */}
            <div style={{ marginTop: 24 }}>
              <div className="sectionTitle" style={{ fontWeight: 700, marginBottom: 10 }}>
                Progression เดือนนี้
              </div>
              <div style={{ background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16, padding: "16px 18px" }}>
                {(() => {
                  const CLUB_TARGET = 1000000;
                  const PT_TARGET = 480000;
                  const clubVal = clubSales || 0;
                  const ptVal = ptSales || 0;
                  const clubPct = Math.min(100, Math.round((clubVal / CLUB_TARGET) * 100));
                  const ptPct = Math.min(100, Math.round((ptVal / PT_TARGET) * 100));
                  return (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>คลับรวม</span>
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                          <b style={{ color: GOLD_DARK, fontFamily: "'Space Grotesk', sans-serif" }}>{loading ? "…" : fmtBaht(clubVal)}</b> / {fmtBaht(CLUB_TARGET)}
                        </span>
                      </div>
                      <div style={{ height: 10, background: "#F0EEE8", borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ width: `${clubPct}%`, height: "100%", background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD})`, borderRadius: 6 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>ทำได้แล้ว {clubPct}% ของเป้า</div>

                      <div style={{ height: 1, background: "#F0EEE8", margin: "16px 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>PT</span>
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                          <b style={{ color: GOLD_DARK, fontFamily: "'Space Grotesk', sans-serif" }}>{loading ? "…" : fmtBaht(ptVal)}</b> / {fmtBaht(PT_TARGET)}
                        </span>
                      </div>
                      <div style={{ height: 10, background: "#F0EEE8", borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ width: `${ptPct}%`, height: "100%", background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD})`, borderRadius: 6 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>ทำได้แล้ว {ptPct}% ของเป้า PT</div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Leaderboard ยอดขาย PT ของเดือนนี้ — อันดับ 1-3 ใส่ Gold/Silver/Bronze */}
            <div style={{ marginTop: 24 }}>
              <div className="sectionTitle" style={{ fontWeight: 700, marginBottom: 10 }}>
                Leaderboard ยอดขาย PT
              </div>
              {leaderboardLoading ? (
                <div style={{ padding: 16, fontSize: 12.5, color: "#9CA3AF", background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16 }}>
                  กำลังโหลด…
                </div>
              ) : leaderboard.length === 0 ? (
                <div style={{ padding: 16, fontSize: 12.5, color: "#9CA3AF", background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16 }}>
                  ยังไม่มีข้อมูลยอดขาย PT เดือนนี้
                </div>
              ) : (
                <div style={{ background: "#FFFFFF", border: "1px solid #ECE9E1", borderRadius: 16, overflow: "hidden" }}>
                  {leaderboard.map((row, i) => {
                    const rank = i + 1;
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
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: medal ? 700 : 600, color: medal ? medal.text : "#111318" }}>
                          {row.name}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: medal ? medal.text : "#111318",
                          }}
                        >
                          {fmtBaht(row.total)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ที่ใช้บ่อย — โชว์ตรงหน้าแรกเลย ไม่ต้องคลิกเข้าหมวด */}
            <div
              style={{
                marginTop: 24,
                background: `${GOLD}0D`,
                border: `1px solid ${GOLD}33`,
                borderRadius: 20,
                padding: 16,
              }}
            >
              <div className="sectionTitle" style={{ fontWeight: 700, marginBottom: 14 }}>ที่ใช้บ่อย</div>
              <div className="frequentGrid">
                {frequentItems.map((item) => (
                  <IconCard key={item.label} icon={item.icon} label={item.label} description={item.description} href={item.href} highlight />
                ))}
              </div>
            </div>

            {/* หมวดหมู่อื่นๆ — คลิกเข้าไปดูลิงก์ข้างใน */}
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
            {/* หลังคลิกหมวด: การ์ดลิงก์แต่ละอัน — ไอคอน + ชื่อ + คำอธิบายสั้นๆ เปิดแท็บใหม่ */}
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
      )}
    </div>
  );
}

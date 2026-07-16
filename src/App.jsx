import React, { useEffect, useState } from "react";
import {
  Dumbbell,
  TrendingUp,
  Users,
  FileText,
  UserPlus,
  Wallet,
  ClipboardList,
  Receipt,
  ClipboardCheck,
  FileSignature,
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

const sections = [
  {
    id: "revenue",
    label: "รายรับ / รายจ่าย",
    icon: TrendingUp,
    items: [
      {
        label: "คำนวณค่าคอม_PT",
        icon: TrendingUp,
        href: "https://docs.google.com/spreadsheets/d/1cI4VGPDGgv1vvqWy2Rrtv7fTbBygAi_l9eaAl78M8hs/edit",
      },
    ],
  },
  {
    id: "forms",
    label: "แบบฟอร์ม",
    icon: FileText,
    items: [
      {
        label: "ฟอร์มสมัคร MB",
        icon: UserPlus,
        href: "https://docs.google.com/forms/d/e/1FAIpQLSdpAkyz7xEH185jI7OHEH19JIut2jWloa8dm44pIzGW0EgC6g/viewform",
      },
      {
        label: "ฟอร์มสมัคร PT",
        icon: Dumbbell,
        href: "https://docs.google.com/forms/d/e/1FAIpQLSePqvl8De-2pAWmY61xVLQX-R0iRjUifkd_uBU18p9b5VKU3g/viewform",
      },
      {
        label: "ฟอร์มเบิกเงิน",
        icon: Wallet,
        href: "https://docs.google.com/forms/d/e/1FAIpQLScxE2zxvT-EwHF1pKdNtKByBZk54ehqwNYMEbi_CFttiI9IFQ/viewform",
      },
    ],
  },
  {
    id: "records",
    label: "หลังกรอกฟอร์ม",
    icon: ClipboardList,
    items: [
      {
        label: "หลังกรอก_PT/MB/เบิกเงิน",
        icon: ClipboardList,
        href: "https://docs.google.com/spreadsheets/d/1OXyNdqlLjvT1lvfE-uIZSTaVqaUoe6VfKUgaY6xDjc0/edit",
      },
      {
        label: "รายการเบิกเงิน",
        icon: Receipt,
        href: "https://docs.google.com/spreadsheets/u/1/d/1VilTSeJGCDTw6mnEbZGVw9GPjbXwPNTKinElossaEPc/htmlview",
      },
    ],
  },
  {
    id: "contracts",
    label: "สัญญา",
    icon: FileSignature,
    items: [
      {
        label: "สัญญา MB",
        icon: FileSignature,
        href: "https://docs.google.com/document/d/1ey2s60EYX9TZ_wu9oAQ1ZcM2Al2ULaAtWYtOLt916Yg/edit?usp=share_link",
      },
      {
        label: "สัญญา PT",
        icon: FileSignature,
        href: "https://docs.google.com/document/d/1nkHuz8ydD5jjrCZD_2zGuK_RacNCnt_RdHuP3fEzrps/edit?usp=sharing",
      },
    ],
  },
  {
    id: "attendance",
    label: "การเข้างาน",
    icon: Users,
    items: [
      {
        label: "เช็คชื่อทำงาน_DB",
        icon: ClipboardCheck,
        href: "https://docs.google.com/spreadsheets/d/1xH5kKeXAqNaEZzheWAFZEKdQHbsMi55AipuoTkn_PoY/edit",
      },
    ],
  },
];

function LinkCard({ item }) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      className="tap linkCard"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        color: "#111318",
        background: "#FFFFFF",
        border: "1px solid #ECE9E1",
        borderRadius: 18,
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <div className="linkCardIcon" style={{ borderRadius: 14, background: `${GOLD}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} color={GOLD_DARK} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>{item.label}</div>
    </a>
  );
}

export default function OpsHubStaffResponsive() {
  const [clubSales, setClubSales] = useState(null);
  const [ptSales, setPtSales] = useState(null);
  const [loading, setLoading] = useState(true);

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
        .linkCard { padding: 20px 12px 16px; }
        .linkCardIcon { width: 48px; height: 48px; }
        .dashRow { display: flex; gap: 8px; flex-shrink: 1; min-width: 0; }
        .dashCard { padding: 8px 12px; min-width: 0; }
        .dashLabel { font-size: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dashValue { font-size: 13px; white-space: nowrap; }
        .labelFull { display: none; }
        .labelShort { display: inline; }

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
          .linkCard { padding: 26px 16px 20px; }
          .linkCardIcon { width: 56px; height: 56px; }
          .tap:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
          .wrap { padding: 0 40px; }
          .dashCard { padding: 8px 16px; }
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

      <div className="wrap">
        {/* Sections */}
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={section.id} style={{ marginTop: i === 0 ? 24 : 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon className="sectionIcon" color={GOLD_DARK} />
                <div className="sectionTitle" style={{ fontWeight: 700 }}>{section.label}</div>
              </div>
              <div className="grid">
                {section.items.map((item) => (
                  <LinkCard key={item.label} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

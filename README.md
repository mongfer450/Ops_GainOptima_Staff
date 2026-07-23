# Gain Optima — Owner Console

เวอร์ชันสำหรับเจ้าของ/แอดมิน — หน้าแรกเป็นการ์ดหมวดหมู่ (ไอคอน+คำอธิบายสั้นๆ) กดเข้าไปแล้วเห็นการ์ดลิงก์แต่ละระบบในหมวดนั้น (ไอคอน+คำอธิบายสั้นๆ เหมือนกัน) มี real-time dashboard ยอดขายคลับ/ทีม PT ที่ header ด้วย

## วิธี Deploy บน GitHub Pages

### 1. สร้าง Repository ใหม่บน GitHub
- ไปที่ https://github.com/new
- ตั้งชื่อ repo เช่น `gain-optima-owner-console`
- เลือก Public
- ไม่ต้องติ๊ก "Add README"

### 2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น repo
- เปิดหน้า repo → **Add file → Upload files**
- ลากไฟล์/โฟลเดอร์ทั้งหมด (`package.json`, `vite.config.js`, `index.html`, `src/`, `.github/`) เข้าไป
- **สำคัญ**: เช็คว่ามีไฟล์ `.github/workflows/deploy.yml` ติดขึ้นไปด้วย (โฟลเดอร์ที่ขึ้นต้นด้วยจุดมักถูกซ่อนตอนลากอัปโหลดจาก Mac) — ถ้าไม่มีให้สร้างเองผ่าน **Add file → Create new file** แล้วพิมพ์ path เต็มว่า `.github/workflows/deploy.yml`
- กด Commit

### 3. เปิดใช้งาน GitHub Pages
- ไปที่ repo → **Settings → Pages**
- Source เลือก **GitHub Actions**

### 4. รอ 1-2 นาที เช็คแท็บ Actions
- ต้องขึ้นเครื่องหมายถูกเขียว ✅
- เว็บจะขึ้นที่: `https://<your-username>.github.io/gain-optima-owner-console/`

## หมายเหตุ
- Real-time dashboard (ยอดขายคลับ/ทีม PT) ต้องให้ Sheet "Gain Optima — Revenue" แชร์เป็น **Anyone with the link — Viewer** ไม่งั้นจะขึ้น "—"
- แก้ไฟล์ `src/App.jsx` แล้ว commit ใหม่ — GitHub Actions จะ build ให้อัตโนมัติ

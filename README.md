# Gain Optima — Staff Hub

เวอร์ชันสำหรับพนักงาน (ตัดลิงก์ที่ไม่จำเป็นออก, กดการ์ดเข้าลิงก์ได้ทันที 1 ครั้ง)

## วิธี Deploy บน GitHub Pages

### 1. สร้าง Repository ใหม่บน GitHub
- ไปที่ https://github.com/new
- ตั้งชื่อ repo เช่น `gain-optima-staff-hub`
- เลือก Public
- ไม่ต้องติ๊ก "Add README"

### 2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น repo
- เปิดหน้า repo → **Add file → Upload files**
- ลากไฟล์/โฟลเดอร์ทั้งหมด (`package.json`, `vite.config.js`, `index.html`, `src/`, `.github/`) เข้าไป
- **สำคัญ**: โฟลเดอร์ `.github` ขึ้นต้นด้วยจุด บางเครื่อง (โดยเฉพาะ Mac) จะซ่อนไว้ไม่ลากขึ้นให้อัตโนมัติ — ถ้าอัปโหลดแล้วเช็คในหน้า repo ว่ามีไฟล์ `.github/workflows/deploy.yml` อยู่จริง ถ้าไม่มีให้สร้างเองผ่านปุ่ม **Add file → Create new file** แล้วพิมพ์ path เต็มว่า `.github/workflows/deploy.yml`
- กด Commit

### 3. เปิดใช้งาน GitHub Pages
- ไปที่ repo → **Settings → Pages**
- หัวข้อ "Build and deployment" → Source เลือก **GitHub Actions**

### 4. รอ 1-2 นาที แล้วเช็คแท็บ Actions
- ต้องขึ้นเครื่องหมายถูกเขียว ✅ ถึงจะ deploy สำเร็จ
- เว็บจะขึ้นที่: `https://<your-username>.github.io/gain-optima-staff-hub/`

## แก้ไขเนื้อหาในอนาคต
แก้ไฟล์ `src/App.jsx` แล้ว commit ใหม่ — GitHub Actions จะ build และอัปเดตเว็บให้อัตโนมัติ

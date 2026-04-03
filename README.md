# 🎓 TutorRMUTTO (uni-tutor)

แพลตฟอร์ม "พี่สอนน้อง" สำหรับนักศึกษามหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก (RMUTTO) วิทยาเขตบางพระ ระบบจับคู่อัจฉริยะ (Smart Matching) ระหว่างนักศึกษาที่ต้องการหาคนช่วยติว และติวเตอร์ที่ต้องการรับสอน 🚀

🌍 **Live Demo:** [https://uni-tutor-ecru.vercel.app](https://uni-tutor-ecru.vercel.app)

---

## 🛠️ Tech Stack (เครื่องมือที่ใช้พัฒนา)

- **Framework:** [SvelteKit](https://kit.svelte.dev/) (เขียนด้วย TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Email Service:** [Resend](https://resend.com/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started (วิธีรันโปรเจกต์ในเครื่อง)

สำหรับทีม Dev ที่ต้องการดึงโค้ดไปรันในเครื่องตัวเอง ให้ทำตามขั้นตอนดังนี้:

### 1. โคลนโปรเจกต์ลงเครื่อง

```bash
git clone [https://github.com/modsunxx/uni-tutor.git](https://github.com/modsunxx/uni-tutor.git)
cd uni-tutor

2. ติดตั้ง Dependencies
Bash
npm install
3. ตั้งค่า Environment Variables (กุญแจลับ)
คัดลอกไฟล์ .env.example แล้วเปลี่ยนชื่อเป็น .env

ขอรหัสลับของ Supabase (URL และ Anon Key) จากหัวหน้าทีม แล้วนำมาใส่ในไฟล์ .env
PUBLIC_SUPABASE_URL=ใส่ลิงก์ตรงนี้
PUBLIC_SUPABASE_ANON_KEY=ใส่คีย์ตรงนี้
(⚠️ ข้อควรระวัง: ห้ามนำไฟล์ .env อัปโหลดขึ้น GitHub เด็ดขาด)

4. รันเซิร์ฟเวอร์จำลอง (Development Server)
Bash
npm run dev
เปิดเบราว์เซอร์ไปที่ http://localhost:5173 เพื่อดูผลลัพธ์การทำงาน

🤝 Workflow การทำงานเป็นทีม (Git)
เพื่อป้องกันไม่ให้โค้ดทับกัน กรุณาทำตามข้อตกลงนี้:

ก่อนเริ่มงาน ให้ดึงโค้ดล่าสุดเสมอ (git checkout main -> git pull origin main)

สร้าง Branch ใหม่สำหรับฟีเจอร์ที่ตัวเองทำ (git checkout -b feature/ชื่อฟีเจอร์)

เมื่อเขียนโค้ดเสร็จ ให้ Push Branch นั้นขึ้นไป (git push origin feature/ชื่อฟีเจอร์)

เปิด Pull Request (PR) บน GitHub เพื่อให้เพื่อนในทีมช่วยรีวิวโค้ดก่อนกด Merge เข้า main

📦 Building for Production
หากต้องการ Build โค้ดเพื่อเตรียมนำขึ้นเซิร์ฟเวอร์จริง:

Bash
npm run build
ทดสอบรันไฟล์ที่ Build แล้ว:

Bash
npm run preview

วางเสร็จแล้วกด `Ctrl + S` เซฟได้เลยครับ! คราวนี้โครงสร้างเป๊ะ สีสันสวยงาม อ่านง่ายสบายตาทีม Dev แน่นอนครับ 💯
```

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Contributors

- [modsunxx](https://github.com/modsunxx) - Project Lead
- RMUTTO Development Team

---

## 💬 Support

For questions or issues, please open an issue on GitHub or contact the development team.

Happy coding! 🎉

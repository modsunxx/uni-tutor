import { json } from '@sveltejs/kit';
import { RESEND_API_KEY } from '$env/static/private'; // 🌟 ดึงคีย์ลับจาก .env

export async function POST({ request }) {
	try {
		// 1. รับข้อมูลที่หน้าบ้าน (Frontend) ส่งมาให้
		const data = await request.json();
		const { tutorEmail, tutorName, studentEmail, subject, timeSlot, note } = data;

		// 2. ยิงคำสั่งไปหาเซิร์ฟเวอร์ของ Resend ให้ส่งอีเมล
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${RESEND_API_KEY}`
			},
			body: JSON.stringify({
				from: 'TutorRMUTTO <onboarding@resend.dev>', // ⚠️ ใช้เมลทดลองของ Resend ไปก่อน
				to: tutorEmail, // ส่งหาอีเมลติวเตอร์
				subject: `🎉 มีนักเรียนทักแชท/จองเวลาเรียนวิชา ${subject}!`,
				html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #02c2ff;">สวัสดีคุณ ${tutorName},</h2>
                        <p>มีนักเรียนสนใจจองเวลาเรียนกับคุณในระบบ <strong>TutorRMUTTO</strong> ครับ!</p>
                        
                        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #334155;">รายละเอียดคำขอ:</h3>
                            <ul style="color: #475569; line-height: 1.6;">
                                <li><strong>วิชา:</strong> ${subject}</li>
                                <li><strong>เวลาที่สะดวก:</strong> ${timeSlot}</li>
                                <li><strong>อีเมลนักเรียน:</strong> ${studentEmail}</li>
                                <li><strong>ข้อความถึงคุณ:</strong> <br> <span style="background: #fff; padding: 10px; display: block; border-radius: 5px; border: 1px solid #e2e8f0; margin-top: 5px;">"${note || '-'}"</span></li>
                            </ul>
                        </div>

                        <p>กรุณาเข้าสู่ระบบเพื่อยืนยันคำขอและพูดคุยกับนักเรียนนะครับ</p>
                        <br>
                        <p style="color: #64748b; font-size: 14px;">ขอบคุณครับ<br>ทีมงาน TutorRMUTTO 🚀</p>
                    </div>
                `
			})
		});

		if (!res.ok) {
			const errorData = await res.json();
			console.error('Resend Error:', errorData);
			return json({ success: false, error: errorData }, { status: res.status });
		}

		return json({ success: true, message: 'Email sent successfully' });
	} catch (err: any) {
		console.error('Server Error:', err.message);
		return json({ success: false, error: err.message }, { status: 500 });
	}
}

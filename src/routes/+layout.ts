import { supabase } from '$lib/supabaseClient';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	// ดึง Session ตั้งแต่ตอนโหลด Layout บังคับให้ระบบรอก่อนเรนเดอร์
	const {
		data: { session }
	} = await supabase.auth.getSession();

	let profileRole = 'student';
	let userEmail = '';

	if (session) {
		userEmail = session.user.email || '';

		// ดึง Role จาก profiles ตั้งแต่ตรงนี้เลย
		const { data: profile } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', session.user.id)
			.single();

		if (profile) profileRole = profile.role;
	}

	// ส่งข้อมูล Session, Email, Role ไปให้ทุกหน้าที่อยู่ใต้ Layout นี้ใช้งาน
	return {
		session,
		userEmail,
		profileRole
	};
};

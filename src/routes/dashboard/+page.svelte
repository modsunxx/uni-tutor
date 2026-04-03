<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	let loading = $state(true);
	let saving = $state(false);

	let tutorName = $state('ติวเตอร์');
	let tutorAvatarUrl = $state('');
	let tutorProfile = $state<any>(null);
	let bookingRequests = $state<any[]>([]);
	let mySchedule = $state<any[]>([]);
	let activeTab = $state('profile');

	// ตัวแปรฟอร์ม
	let faculty = $state('');
	let major = $state('');
	let academicYear = $state('');
	let bio = $state('');
	let price = $state(0);

	// 🌟 ตัวแปรใหม่สำหรับระบบค้นหาวิชา 🌟
	let allSubjects = $state<any[]>([]); // เก็บวิชาทั้งหมดจากฐานข้อมูล
	let subjectSearch = $state(''); // คำค้นหาที่ติวเตอร์พิมพ์
	let selectedSubjects = $state<string[]>([]); // เก็บวิชาที่ติวเตอร์กดเลือกแล้ว (เป็น Array ของ String)

	// ตัวแปรตารางเวลา
	let newDay = $state('จันทร์');
	let newStartTime = $state('17:00');
	let newEndTime = $state('19:00');
	const allDays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
	const allYears = [
		'ปี 1',
		'ปี 2',
		'ปี 3',
		'ปี 4',
		'ปี 5',
		'ปี 3 เทียบโอน',
		'ปี 4 เทียบโอน',
		'ปี 5 เทียบโอน',
		'ปริญญาโท',
		'ปริญญาเอก',
		'ศิษย์เก่า'
	];

	const universityData: Record<string, string[]> = {
		คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ: [
			'สาขาวิชาออกแบบและสร้างสรรค์ภูมิทัศน์',
			'สาขาวิชาสัตวศาสตร์',
			'สาขาวิชาเทคโนโลยีเพาะเลี้ยงสัตว์น้ำและการจัดการ',
			'สาขาวิชาเทคโนโลยีการผลิตพืช',
			'สาขาวิชาเทคโนโลยีการจัดการอุตสาหกรรมเพื่อความยั่งยืน',
			'สาขาวิชาวิศวกรรมเครื่องจักรกลเกษตร'
		],
		คณะมนุษยศาสตร์และสังคมศาสตร์: [
			'หลักสูตรบัญชีบัณฑิต',
			'สาขาวิชาภาษาอังกฤษเพื่อการสื่อสารสากล',
			'สาขาวิชาการจัดการโลจิสติกส์และซัพพลายเชนดิจิทัล (การจัดการสินค้าคงคลังและคลังสินค้าดิจิทัล)',
			'สาขาวิชาการจัดการโลจิสติกส์และซัพพลายเชนดิจิทัล (การค้าระหว่างประเทศและการจัดการขนส่งดิจิทัล)',
			'วิชาเอกการตลาดสมัยใหม่',
			'วิชาเอกเทคโนโลยีการลงทุน',
			'วิชาเอกการประกันวินาศภัย',
			'สาขาวิชาการจัดการ'
		],
		คณะวิทยาศาสตร์และเทคโนโลยี: [
			'สาขาวิชาวิทยาศาสตร์และเทคโนโลยีการอาหาร',
			'สาขาวิชาเทคโนโลยีการประกอบอาหารและการบริการ',
			'สาขาวิชาวิทยาการคอมพิวเตอร์',
			'สาขาวิชาเทคโนโลยีสารสนเทศและการสื่อสาร',
			'สาขาวิชาผลิตภัณฑ์เพื่อสุขภาพและความงาม'
		],
		คณะสัตวแพทยศาสตร์: ['สาขาวิชาวิทยาศาสตร์สุขภาพสัตว์', 'หลักสูตรสัตวแพทยศาสตรบัณฑิต'],
		สำนักวิชาวิศวกรรมศาสตร์และนวัตกรรม: [
			'สาขาวิชาวิศวกรรมเมคคาทรอนิกส์และหุ่นยนต์',
			'สาขาวิชาวิศวกรรมอุตสาหการและโลจิสติกส์'
		],
		สถาบันนวัตกรรมการศึกษาและการเรียนรู้ตลอดชีวิต: [
			'สาขาวิชาการจัดการธุรกิจการบินนานาชาติ',
			'สาขาวิชาสถาปัตยกรรม'
		]
	};

	onMount(async () => {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) {
			goto('/');
			return;
		}

		// 🌟 ดึงข้อมูลรายวิชาทั้งหมดมาเก็บไว้ในเครื่องเพื่อความรวดเร็วในการค้นหา 🌟
		const { data: subjectsData } = await supabase.from('subjects').select('*');
		if (subjectsData) allSubjects = subjectsData;

		const { data: userProfile } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', session.user.id)
			.single();
		if (userProfile) {
			tutorName = userProfile.full_name || 'ติวเตอร์';
			tutorAvatarUrl = userProfile.avatar_url || '';
		}

		const { data: profile } = await supabase
			.from('tutor_profiles')
			.select('*')
			.eq('tutor_id', session.user.id)
			.single();
		if (profile) {
			tutorProfile = profile;
			faculty = profile.faculty || '';
			major = profile.major || '';
			academicYear = profile.academic_year || '';
			bio = profile.bio || '';
			price = profile.price_per_hour || 0;
			// ดึงวิชาที่เคยเลือกไว้มาโชว์
			selectedSubjects = profile.subjects || [];
		}

		const { data: bookings } = await supabase
			.from('bookings')
			.select('*, profiles:student_id(*)')
			.eq('tutor_id', session.user.id)
			.order('created_at', { ascending: false });
		bookingRequests = bookings || [];

		const { data: avail } = await supabase
			.from('tutor_availability')
			.select('*')
			.eq('tutor_id', session.user.id)
			.order('day_of_week');
		mySchedule = avail || [];

		loading = false;
	});

	// 🌟 ระบบกรองวิชาแบบ Real-time (โชว์สูงสุด 10 วิชา) 🌟
	let filteredSubjects = $derived(
		subjectSearch.trim() === ''
			? []
			: allSubjects
					.filter(
						(s) =>
							s.course_code.includes(subjectSearch) ||
							s.course_name.toLowerCase().includes(subjectSearch.toLowerCase())
					)
					.slice(0, 10)
	);

	// ฟังก์ชันเพิ่มวิชา
	const addSubject = (subjectData: any) => {
		const subjectString = `${subjectData.course_code} ${subjectData.course_name}`;
		if (!selectedSubjects.includes(subjectString)) {
			selectedSubjects = [...selectedSubjects, subjectString];
		}
		subjectSearch = ''; // เคลียร์ช่องค้นหา
	};

	// ฟังก์ชันลบวิชา
	const removeSubject = (subjectString: string) => {
		selectedSubjects = selectedSubjects.filter((s) => s !== subjectString);
	};

	const upsertTutorProfile = async () => {
		saving = true;
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) return;

		// บันทึก selectedSubjects เข้าฐานข้อมูลตรงๆ เลย
		const { error: tutorError } = await supabase.from('tutor_profiles').upsert({
			tutor_id: session.user.id,
			faculty,
			major,
			academic_year: academicYear,
			bio,
			price_per_hour: price,
			subjects: selectedSubjects
		});

		if (tutorError) alert('เกิดข้อผิดพลาด: ' + tutorError.message);
		else {
			alert('💾 บันทึกโปรไฟล์การสอนสำเร็จ!');
			window.location.reload();
		}
		saving = false;
	};

	const acceptRequest = async (id: number) => {
		const { error } = await supabase.from('bookings').update({ status: 'accepted' }).eq('id', id);
		if (!error) {
			bookingRequests = bookingRequests.map((req) =>
				req.id === id ? { ...req, status: 'accepted' } : req
			);
			alert('✅ รับงานสอนเรียบร้อย!');
		}
	};

	const declineRequest = async (id: number) => {
		if (confirm('แน่ใจหรือไม่ที่จะปฏิเสธคำขอนี้?')) {
			const { error } = await supabase.from('bookings').update({ status: 'declined' }).eq('id', id);
			if (!error)
				bookingRequests = bookingRequests.map((req) =>
					req.id === id ? { ...req, status: 'declined' } : req
				);
		}
	};

	const addTimeSlot = async () => {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		const { data, error } = await supabase
			.from('tutor_availability')
			.insert({
				tutor_id: session?.user.id,
				day_of_week: newDay,
				start_time: newStartTime,
				end_time: newEndTime
			})
			.select()
			.single();
		if (!error && data) mySchedule = [...mySchedule, data];
		else alert('เกิดข้อผิดพลาด: ' + (error?.message || 'ไม่สามารถเพิ่มได้'));
	};

	const deleteTimeSlot = async (id: number) => {
		const { error } = await supabase.from('tutor_availability').delete().eq('id', id);
		if (!error) mySchedule = mySchedule.filter((slot) => slot.id !== id);
	};

	let pendingCount = $derived(bookingRequests.filter((r) => r.status === 'pending').length);
</script>

<div class="flex min-h-screen flex-col bg-slate-50">
	<Navbar />
	<main class="grow px-4 py-10 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-5xl">
			{#if loading}
				<p class="animate-pulse py-20 text-center text-gray-500">⏳ กำลังโหลดข้อมูลแดชบอร์ด...</p>
			{:else}
				<div class="mb-8">
					<h1 class="text-3xl font-extrabold text-gray-900">สวัสดี, {tutorName} 👋</h1>
				</div>
				<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div
						class="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
					>
						<p class="text-sm font-medium text-gray-500">คำขอเรียนใหม่</p>
						<p class="mt-2 text-3xl font-bold text-[#02c2ff]">{pendingCount}</p>
					</div>
					<div
						class="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
					>
						<p class="text-sm font-medium text-gray-500">เรทติ้งของคุณ</p>
						<p class="mt-2 text-3xl font-bold text-amber-500">
							⭐ {tutorProfile?.rating?.toFixed(1) || '0.0'}
						</p>
					</div>
					<div
						class="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
					>
						<p class="text-sm font-medium text-gray-500">สถานะโปรไฟล์</p>
						<p class="text-xl font-bold {tutorProfile ? 'text-emerald-500' : 'text-rose-500'} mt-3">
							{tutorProfile ? '✅ เปิดรับสอน' : '❌ ยังไม่สมบูรณ์'}
						</p>
					</div>
				</div>

				<div class="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-px">
					<button
						onclick={() => (activeTab = 'requests')}
						class="border-b-2 px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors {activeTab ===
						'requests'
							? 'border-[#02c2ff] text-[#02c2ff]'
							: 'border-transparent text-gray-500 hover:text-gray-800'}"
						>📥 คำขอเรียน ({pendingCount})</button
					>
					<button
						onclick={() => (activeTab = 'schedule')}
						class="border-b-2 px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors {activeTab ===
						'schedule'
							? 'border-[#02c2ff] text-[#02c2ff]'
							: 'border-transparent text-gray-500 hover:text-gray-800'}">⏰ ตารางเวลา</button
					>
					<button
						onclick={() => (activeTab = 'profile')}
						class="border-b-2 px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors {activeTab ===
						'profile'
							? 'border-[#02c2ff] text-[#02c2ff]'
							: 'border-transparent text-gray-500 hover:text-gray-800'}">👤 โปรไฟล์การสอน</button
					>
				</div>

				<div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
					{#if activeTab === 'requests'}
						<h2 class="mb-6 text-xl font-bold text-gray-900">คำขอเรียนจากน้องๆ</h2>
						<div class="space-y-4">
							{#each bookingRequests as req}
								{#if req.status !== 'declined'}
									<div
										class="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-slate-50 p-5 transition-all hover:border-[#9ae7ff] hover:bg-[#f0faff] md:flex-row md:items-center"
									>
										<div>
											<div class="mb-1 flex items-center gap-2">
												<span class="text-lg font-bold text-gray-900"
													>{req.profiles?.full_name || 'ไม่ทราบชื่อ'}</span
												>
												{#if req.status === 'pending'}<span
														class="rounded border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700"
														>รอการยืนยัน</span
													>
												{:else}<span
														class="rounded border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700"
														>รับงานแล้ว</span
													>{/if}
											</div>
											<p class="text-sm font-bold text-[#02c2ff]">📚 วิชา: {req.subject}</p>
											<p class="mt-1 text-sm text-gray-600">
												⏰ วัน{req.day_of_week} เวลา {req.start_time.substring(0, 5)} - {req.end_time.substring(
													0,
													5
												)}
											</p>
											{#if req.note}<p
													class="mt-2 rounded-lg border border-gray-100 bg-white p-2 text-sm text-gray-500 italic"
												>
													" {req.note} "
												</p>{/if}
										</div>
										{#if req.status === 'pending'}
											<div class="mt-2 flex w-full gap-2 md:mt-0 md:w-auto">
												<button
													onclick={() => acceptRequest(req.id)}
													class="flex-1 rounded-xl bg-[#02c2ff] px-6 py-2.5 font-bold text-white shadow-sm hover:bg-[#35ceff] md:flex-none"
													>✅ รับสอน</button
												>
												<button
													onclick={() => declineRequest(req.id)}
													class="flex-1 rounded-xl border border-rose-200 bg-white px-4 py-2.5 font-bold text-rose-500 hover:bg-rose-50 md:flex-none"
													>❌ ปฏิเสธ</button
												>
											</div>
										{:else}
											<button
												class="w-full rounded-xl bg-gray-900 px-6 py-2.5 font-bold text-white shadow-sm hover:bg-gray-800 md:w-auto"
												>💬 ทักแชท (โทร: {req.profiles?.phone || '-'})</button
											>
										{/if}
									</div>
								{/if}
							{:else}
								<div
									class="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-gray-200"
								>
									<p class="text-gray-500 font-medium">ยังไม่มีคำขอเรียนเข้ามาครับ</p>
								</div>
							{/each}
						</div>
					{/if}

					{#if activeTab === 'schedule'}
						<div class="mb-8 rounded-2xl border border-gray-200 bg-slate-50 p-6">
							<h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
								⏱️ เพิ่มเวลาที่สะดวกรับสอน
							</h3>
							<div class="flex flex-col items-end gap-4 sm:flex-row">
								<div class="w-full sm:w-1/3">
									<label class="mb-1 block text-xs font-bold text-gray-500">วันในสัปดาห์</label>
									<select
										bind:value={newDay}
										class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-[#02c2ff] focus:ring-[#02c2ff]"
									>
										{#each allDays as d}
											<option value={d}>{d}</option>
										{/each}
									</select>
								</div>
								<div class="w-full sm:w-1/3">
									<label class="mb-1 block text-xs font-bold text-gray-500">เวลาเริ่ม</label>
									<input
										type="time"
										bind:value={newStartTime}
										class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-[#02c2ff] focus:ring-[#02c2ff]"
									/>
								</div>
								<div class="w-full sm:w-1/3">
									<label class="mb-1 block text-xs font-bold text-gray-500">เวลาสิ้นสุด</label>
									<input
										type="time"
										bind:value={newEndTime}
										class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-[#02c2ff] focus:ring-[#02c2ff]"
									/>
								</div>
								<button
									onclick={addTimeSlot}
									class="w-full rounded-xl bg-gray-900 px-8 py-3 font-bold whitespace-nowrap text-white shadow-md transition-all hover:bg-gray-800 sm:w-auto"
									>+ เพิ่มเวลา</button
								>
							</div>
						</div>

						<h3 class="mb-4 text-lg font-bold text-gray-900">ตารางเวลาปัจจุบันของคุณ</h3>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each mySchedule as slot}
								<div
									class="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#9ae7ff]"
								>
									<div>
										<div class="mb-1 flex items-center gap-2">
											<div class="h-2 w-2 rounded-full bg-green-500"></div>
											<span class="font-bold text-gray-800">วัน{slot.day_of_week}</span>
										</div>
										<span
											class="rounded-md border border-[#ccf3ff] bg-[#f0faff] px-2 py-1 text-sm font-medium text-[#02c2ff]"
											>{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</span
										>
									</div>
									<button
										onclick={() => deleteTimeSlot(slot.id)}
										class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition-colors hover:bg-rose-500 hover:text-white"
										title="ลบเวลา">🗑️</button
									>
								</div>
							{:else}
								<p
									class="text-gray-500 col-span-full text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200"
								>
									ยังไม่ได้เพิ่มตารางเวลาว่าง ระบบจะไม่สามารถจับคู่อัจฉริยะให้น้องๆ เห็นคุณได้ครับ
								</p>
							{/each}
						</div>
					{/if}

					{#if activeTab === 'profile'}
						<div class="max-w-3xl">
							<div
								class="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-slate-50 p-5 sm:flex-row"
							>
								<div class="flex items-center gap-4">
									{#if tutorAvatarUrl}
										<img
											src={tutorAvatarUrl}
											alt="Avatar"
											class="h-14 w-14 rounded-full border border-gray-300 object-cover"
										/>
									{:else}
										<div
											class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-white text-gray-400"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												class="mt-2 h-10 w-10"
												><path
													fill-rule="evenodd"
													d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
													clip-rule="evenodd"
												/></svg
											>
										</div>
									{/if}
									<div>
										<p class="font-bold text-gray-900">{tutorName}</p>
										<p class="text-sm text-gray-500">ต้องการเปลี่ยนรูปภาพ ชื่อ หรือเบอร์โทร?</p>
									</div>
								</div>
								<a
									href="/profile"
									class="w-full rounded-xl bg-[#ccf3ff] px-5 py-2.5 text-center text-sm font-bold whitespace-nowrap text-[#02c2ff] transition-colors hover:bg-[#9ae7ff] sm:w-auto"
								>
									⚙️ ไปที่ตั้งค่าบัญชี
								</a>
							</div>

							<div class="space-y-8">
								<div>
									<h3 class="mb-4 border-b border-gray-100 pb-2 text-lg font-bold text-gray-900">
										🎓 ประวัติการศึกษาปัจจุบัน
									</h3>
									<div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
										<div>
											<label class="mb-1 block text-sm font-bold text-gray-700">คณะ</label>
											<select
												bind:value={faculty}
												onchange={() => (major = '')}
												class="w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 transition-all focus:border-[#02c2ff] focus:bg-white focus:ring-[#02c2ff]"
											>
												<option value="" disabled>เลือกคณะ...</option>
												{#each Object.keys(universityData) as fac}
													<option value={fac}>{fac}</option>
												{/each}
											</select>
										</div>
										<div class="sm:col-span-2">
											<label class="mb-1 block text-sm font-bold text-gray-700">สาขาวิชา</label>
											<select
												bind:value={major}
												disabled={!faculty}
												class="w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 transition-all focus:border-[#02c2ff] focus:bg-white focus:ring-[#02c2ff] disabled:cursor-not-allowed disabled:opacity-50"
											>
												<option value="" disabled>เลือกสาขาวิชา...</option>
												{#if faculty && universityData[faculty]}
													{#each universityData[faculty] as maj}
														<option value={maj}>{maj}</option>
													{/each}
												{/if}
											</select>
										</div>
										<div>
											<label class="mb-1 block text-sm font-bold text-gray-700">ชั้นปี</label>
											<select
												bind:value={academicYear}
												class="w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 transition-all focus:border-[#02c2ff] focus:bg-white focus:ring-[#02c2ff]"
											>
												<option value="" disabled>เลือกชั้นปี...</option>
												{#each allYears as year}
													<option value={year}>{year}</option>
												{/each}
											</select>
										</div>
									</div>
								</div>

								<div>
									<h3 class="mb-4 border-b border-gray-100 pb-2 text-lg font-bold text-gray-900">
										💼 ข้อมูลการเป็นติวเตอร์
									</h3>
									<div class="space-y-5">
										<div>
											<label class="mb-1 block text-sm font-bold text-gray-700"
												>แนะนำตัวสั้นๆ (Bio)</label
											>
											<textarea
												bind:value={bio}
												placeholder="แนะนำตัวให้น้องๆ รู้จัก สไตล์การสอนเป็นยังไง ถนัดเรื่องไหนเป็นพิเศษ..."
												rows="3"
												class="w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 transition-all focus:border-[#02c2ff] focus:bg-white focus:ring-[#02c2ff]"
											></textarea>
										</div>

										<div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
											<div class="sm:col-span-2">
												<label class="mb-2 block text-sm font-bold text-gray-700"
													>วิชาที่รับสอน (ค้นหาจากฐานข้อมูล)</label
												>

												<div class="mb-3 flex flex-wrap gap-2">
													{#each selectedSubjects as sub}
														<span
															class="flex items-center gap-2 rounded-lg border border-[#9ae7ff] bg-[#ccf3ff] px-3 py-1.5 text-sm font-bold text-[#02c2ff]"
														>
															{sub}
															<button
																type="button"
																onclick={() => removeSubject(sub)}
																class="flex h-5 w-5 items-center justify-center rounded-full border border-[#9ae7ff] bg-white transition-colors hover:text-rose-500"
																>×</button
															>
														</span>
													{:else}
														<span class="text-gray-400 text-sm italic"
															>ยังไม่ได้เลือกวิชาสอนครับ</span
														>
													{/each}
												</div>

												<div class="relative">
													<div
														class="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus-within:border-[#02c2ff] focus-within:ring-1 focus-within:ring-[#02c2ff]"
													>
														<span class="mr-2 text-gray-400">🔍</span>
														<input
															type="text"
															bind:value={subjectSearch}
															placeholder="พิมพ์รหัสวิชา หรือ ชื่อวิชา เพื่อค้นหา..."
															class="w-full bg-transparent outline-none"
														/>
													</div>

													{#if filteredSubjects.length > 0}
														<ul
															class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
														>
															{#each filteredSubjects as s}
																<li>
																	<button
																		type="button"
																		onclick={() => addSubject(s)}
																		class="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f0faff]"
																	>
																		<span
																			class="mr-2 rounded bg-[#ccf3ff] px-2 py-0.5 font-bold text-[#02c2ff]"
																			>{s.course_code}</span
																		>
																		<span class="text-gray-700">{s.course_name}</span>
																	</button>
																</li>
															{/each}
														</ul>
													{:else if subjectSearch.trim() !== ''}
														<div
															class="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white p-4 text-center text-gray-500 shadow-lg"
														>
															ไม่พบรายวิชาที่ค้นหาครับ
														</div>
													{/if}
												</div>
											</div>

											<div>
												<label class="mb-1 block text-sm font-bold text-gray-700"
													>ราคา (บาท/ชั่วโมง)</label
												>
												<input
													type="number"
													bind:value={price}
													min="0"
													class="w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-lg font-bold text-[#02c2ff] transition-all focus:border-[#02c2ff] focus:bg-white focus:ring-[#02c2ff]"
												/>
											</div>
										</div>
									</div>
								</div>

								<div class="border-t border-gray-100 pt-6">
									<button
										onclick={upsertTutorProfile}
										disabled={saving || selectedSubjects.length === 0 || !faculty || !major}
										class="w-full rounded-xl bg-[#02c2ff] px-12 py-4 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#35ceff] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
									>
										{saving ? '⏳ กำลังบันทึกข้อมูล...' : '💾 บันทึกโปรไฟล์การสอน'}
									</button>
									{#if selectedSubjects.length === 0 || !faculty || !major}
										<p class="mt-2 text-sm font-medium text-rose-500">
											⚠️ กรุณาเลือกคณะ, สาขา และวิชาที่รับสอนให้ครบถ้วนก่อนบันทึกครับ
										</p>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</main>
</div>

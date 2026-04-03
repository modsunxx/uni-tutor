<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	let isMatching = $state(false);

	// 🌟 ตัวแปรระบบค้นหาวิชา
	let allSubjects = $state<any[]>([]);
	let subjectSearch = $state('');
	let showSubjectDropdown = $state(false);

	// ตัวแปรฟอร์มค้นหา
	let selectedFaculties = $state<string[]>([]);
	let scheduleSlots = $state([{ day: 'จันทร์', start: '17:00', end: '19:00' }]);

	// ตัวแปรเก็บผลลัพธ์
	let matchResults = $state<any[] | null>(null);

	const allDays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

	// Map ชื่อย่อปุ่ม กับ ชื่อคณะเต็มๆ ใน Database
	const facultiesList = [
		{ label: 'เกษตรฯ', full: 'คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ' },
		{ label: 'มนุษย์ฯ', full: 'คณะมนุษยศาสตร์และสังคมศาสตร์' },
		{ label: 'วิทยาศาสตร์ฯ', full: 'คณะวิทยาศาสตร์และเทคโนโลยี' },
		{ label: 'สัตวแพทย์ฯ', full: 'คณะสัตวแพทยศาสตร์' },
		{ label: 'วิศวกรรมฯ', full: 'สำนักวิชาวิศวกรรมศาสตร์และนวัตกรรม' },
		{ label: 'นวัตกรรมฯ', full: 'สถาบันนวัตกรรมการศึกษาและการเรียนรู้ตลอดชีวิต' }
	];

	onMount(async () => {
		// โหลดวิชาทั้งหมดมาเก็บไว้ทำ Autocomplete
		const { data } = await supabase.from('subjects').select('*');
		if (data) allSubjects = data;
	});

	// กรองวิชาแบบ Real-time
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

	const selectSubject = (s: any) => {
		subjectSearch = `${s.course_code} ${s.course_name}`;
		showSubjectDropdown = false; // ซ่อน Dropdown หลังเลือกเสร็จ
	};

	const toggleFaculty = (facFull: string) => {
		if (selectedFaculties.includes(facFull)) {
			selectedFaculties = selectedFaculties.filter((f) => f !== facFull);
		} else {
			selectedFaculties = [...selectedFaculties, facFull];
		}
	};

	const addTimeSlot = () =>
		(scheduleSlots = [...scheduleSlots, { day: 'จันทร์', start: '17:00', end: '19:00' }]);
	const removeTimeSlot = (index: number) =>
		(scheduleSlots = scheduleSlots.filter((_, i) => i !== index));

	const clearForm = () => {
		subjectSearch = '';
		selectedFaculties = [];
		scheduleSlots = [{ day: 'จันทร์', start: '17:00', end: '19:00' }];
		matchResults = null;
	};

	const startMatching = async () => {
		if (!subjectSearch) {
			alert('กรุณาระบุวิชาที่ต้องการเรียนก่อนครับ');
			return;
		}

		isMatching = true;

		// ดึงข้อมูลติวเตอร์ทั้งหมดที่เปิดรับสอน พร้อมตารางเวลา
		let { data: tutors } = await supabase.from('tutor_profiles').select(`
				*,
				profiles (full_name, avatar_url),
				tutor_availability (day_of_week, start_time, end_time)
			`);

		if (tutors) {
			// นำข้อมูลมากรอง (Filter) ด้วย JavaScript
			let filtered = tutors.filter((tutor) => {
				// 1. เช็ควิชา (ติวเตอร์ต้องมีวิชานี้ใน Array subjects)
				const hasSubject = tutor.subjects?.some((s: string) => s.includes(subjectSearch));
				if (!hasSubject) return false;

				// 2. เช็คคณะ (ถ้ามีการจำกัดคณะ)
				if (selectedFaculties.length > 0 && !selectedFaculties.includes(tutor.faculty))
					return false;

				// 3. เช็คเวลา (อย่างน้อยต้องมี 1 ช่วงเวลาที่ตรงกัน)
				// (เดี๋ยวเราค่อยมาเขียนลอจิกเช็คเวลาแบบละเอียดอีกที ตอนนี้ให้ผ่านไปก่อน)
				return true;
			});

			matchResults = filtered;
		}

		isMatching = false;
	};
</script>

<div class="flex min-h-screen flex-col bg-slate-50">
	<Navbar />

	<main class="flex grow items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
		<div class="w-full max-w-3xl">
			<div class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
				<div class="flex items-center gap-3 bg-[#1e293b] p-6 sm:p-8">
					<span class="text-2xl">🔍</span>
					<h1 class="text-2xl font-extrabold text-white">ระบุสเปคที่คุณต้องการ</h1>
				</div>

				<div class="space-y-8 p-6 sm:p-8">
					<div>
						<label class="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700"
							>📚 วิชา หรือ หัวข้อที่อยากเรียน</label
						>
						<div class="relative">
							<input
								type="text"
								bind:value={subjectSearch}
								oninput={() => (showSubjectDropdown = true)}
								placeholder="พิมพ์รหัสวิชา หรือ ชื่อวิชา เช่น 0012001, การพัฒนาบุคลิกภาพ "
								class="w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 transition-all focus:border-[#02c2ff] focus:bg-white focus:ring-[#02c2ff]"
							/>

							{#if showSubjectDropdown && filteredSubjects.length > 0}
								<ul
									class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
								>
									{#each filteredSubjects as s}
										<li>
											<button
												type="button"
												onclick={() => selectSubject(s)}
												class="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f0faff]"
											>
												<span class="mr-2 rounded bg-[#ccf3ff] px-2 py-0.5 font-bold text-[#02c2ff]"
													>{s.course_code}</span
												>
												<span class="text-gray-700">{s.course_name}</span>
											</button>
										</li>
									{/each}
								</ul>
							{:else if showSubjectDropdown && subjectSearch.trim() !== ''}
								<div
									class="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white p-4 text-center text-gray-500 shadow-lg"
								>
									ไม่พบวิชาที่ค้นหา
								</div>
							{/if}
						</div>
					</div>

					<div>
						<label class="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700"
							>🏢 จำกัดคณะของติวเตอร์ไหม?</label
						>
						<div class="flex flex-wrap gap-2">
							{#each facultiesList as fac}
								<button
									onclick={() => toggleFaculty(fac.full)}
									class="rounded-full border px-4 py-2 text-sm font-bold transition-all {selectedFaculties.includes(
										fac.full
									)
										? 'border-[#02c2ff] bg-[#02c2ff] text-white shadow-md'
										: 'border-gray-200 bg-white text-gray-600 hover:border-[#02c2ff] hover:text-[#02c2ff]'}"
								>
									{fac.label}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<div class="mb-3 flex items-center justify-between">
							<label class="flex items-center gap-2 text-sm font-bold text-gray-700"
								>⏰ เวลาที่คุณสะดวกเรียน</label
							>
							<button
								onclick={addTimeSlot}
								class="rounded-lg bg-[#ccf3ff] px-3 py-1.5 text-xs font-bold text-[#02c2ff] transition-colors hover:bg-[#9ae7ff]"
								>+ เพิ่มช่วงเวลา</button
							>
						</div>

						<div class="space-y-3 rounded-2xl border border-gray-100 bg-slate-50 p-4">
							{#each scheduleSlots as slot, i}
								<div class="flex flex-col items-center gap-3 sm:flex-row">
									<select
										bind:value={slot.day}
										class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:ring-[#02c2ff] sm:w-32"
									>
										{#each allDays as d}
											<option value={d}>{d}</option>
										{/each}
									</select>
									<input
										type="time"
										bind:value={slot.start}
										class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:ring-[#02c2ff] sm:flex-1"
									/>
									<span class="font-medium text-gray-400">ถึง</span>
									<input
										type="time"
										bind:value={slot.end}
										class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:ring-[#02c2ff] sm:flex-1"
									/>

									{#if scheduleSlots.length > 1}
										<button
											onclick={() => removeTimeSlot(i)}
											class="p-2 font-bold text-rose-400 hover:text-rose-600">✕</button
										>
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<div class="flex gap-3 pt-4">
						<button
							onclick={startMatching}
							disabled={isMatching}
							class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#02c2ff] py-4 text-lg font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#35ceff] hover:shadow-lg disabled:opacity-50"
						>
							{isMatching ? '⏳ กำลังค้นหา...' : '🚀 เริ่มจับคู่เลย!'}
						</button>
						<button
							onclick={clearForm}
							class="rounded-xl bg-gray-100 px-8 py-4 font-bold text-gray-600 transition-all hover:bg-gray-200"
						>
							ล้างค่า
						</button>
					</div>
				</div>
			</div>

			{#if matchResults !== null}
				<div class="animate-fade-in-up mt-8">
					<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
						🎉 พบติวเตอร์ที่ตรงใจ <span class="text-[#02c2ff]">{matchResults.length}</span> คน
					</h2>

					<div class="space-y-4">
						{#each matchResults as tutor}
							<div
								class="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md sm:flex-row"
							>
								<img
									src={tutor.profiles?.avatar_url ||
										`https://ui-avatars.com/api/?name=${tutor.profiles?.full_name}&background=f1f5f9`}
									alt="Tutor"
									class="h-20 w-20 rounded-full border-4 border-[#ccf3ff] object-cover"
								/>
								<div class="flex-1">
									<div class="mb-2 flex items-start justify-between">
										<div>
											<h3 class="text-lg font-bold text-gray-900">
												{tutor.profiles?.full_name || 'ติวเตอร์'}
											</h3>
											<p class="text-sm text-gray-500">{tutor.faculty} ({tutor.academic_year})</p>
										</div>
										<span
											class="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-600"
											>⭐ {tutor.rating?.toFixed(1) || 'New'}</span
										>
									</div>
									<p class="mb-3 line-clamp-2 text-sm text-gray-600">{tutor.bio}</p>
									<div class="flex items-center justify-between">
										<p class="text-lg font-extrabold text-[#02c2ff]">
											฿{tutor.price_per_hour}<span class="text-sm font-normal text-gray-500">
												/ชม.</span
											>
										</p>
										<button
											class="rounded-xl bg-gray-900 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800"
											>ดูโปรไฟล์ & จองเรียน</button
										>
									</div>
								</div>
							</div>
						{:else}
							<div
								class="bg-white p-10 rounded-2xl border border-dashed border-gray-200 text-center"
							>
								<p class="text-gray-500 font-medium">
									😢 ยังไม่มีติวเตอร์ที่ตรงกับเงื่อนไข ลองปรับเวลาหรือวิชาดูนะครับ
								</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in-up {
		animation: fadeInUp 0.5s ease-out forwards;
	}
</style>

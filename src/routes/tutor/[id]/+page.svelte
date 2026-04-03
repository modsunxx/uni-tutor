<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';

	let loading = $state(true);
	let tutor = $state<any>(null);
	let availability = $state<any[]>([]);

	let selectedSubject = $state('');
	let selectedSlot = $state<any>(null);
	let bookingNote = $state('');

	onMount(async () => {
		const tutorId = $page.params.id;
		const { data: profileData } = await supabase
			.from('tutor_profiles')
			.select('*, profiles(*)')
			.eq('tutor_id', tutorId)
			.single();
		tutor = profileData;
		const { data: availData } = await supabase
			.from('tutor_availability')
			.select('*')
			.eq('tutor_id', tutorId);
		availability = availData || [];
		loading = false;
	});

	const handleBook = async (e: Event) => {
		e.preventDefault();
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) {
			alert('กรุณาเข้าสู่ระบบก่อนจองครับ');
			goto('/');
			return;
		}
		if (!selectedSubject || !selectedSlot) {
			alert('⚠️ กรุณาเลือกวิชาและเวลาที่ต้องการเรียนครับ');
			return;
		}

		const { error } = await supabase.from('bookings').insert({
			student_id: session.user.id,
			tutor_id: tutor.tutor_id,
			subject: selectedSubject,
			day_of_week: selectedSlot.day_of_week,
			start_time: selectedSlot.start_time,
			end_time: selectedSlot.end_time,
			note: bookingNote,
			status: 'pending'
		});
		if (error) alert('เกิดข้อผิดพลาด: ' + error.message);
		else {
			alert('🎉 ส่งคำขอจองสำเร็จ! รอติวเตอร์ตอบรับนะครับ');
			selectedSubject = '';
			selectedSlot = null;
			bookingNote = '';
		}
	};
</script>

<div class="flex min-h-screen flex-col bg-slate-50/50">
	<Navbar />
	<main class="mx-auto w-full max-w-5xl grow px-4 py-10">
		<a
			href="/home"
			class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#02c2ff]"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-5 w-5"
			>
				<path
					fill-rule="evenodd"
					d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
					clip-rule="evenodd"
				/>
			</svg>
			กลับไปหน้าหลัก
		</a>

		{#if loading}
			<div class="flex flex-col items-center justify-center py-20 text-gray-400">
				<div
					class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#02c2ff]"
				></div>
				<p>กำลังโหลดข้อมูลติวเตอร์...</p>
			</div>
		{:else if tutor}
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div class="h-fit rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100 lg:col-span-1">
					<div class="text-center">
						{#if tutor.profiles?.avatar_url}
							<img
								src={tutor.profiles.avatar_url}
								alt="Tutor"
								class="mx-auto h-36 w-36 rounded-full object-cover shadow-md ring-4 ring-slate-50"
							/>
						{:else}
							<div
								class="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-slate-100 text-[#02c2ff] shadow-inner ring-4 ring-slate-50"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="h-20 w-20 opacity-50"
								>
									<path
										fill-rule="evenodd"
										d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
						{/if}

						<h1 class="mt-6 text-2xl font-bold text-gray-900">{tutor.profiles?.full_name}</h1>
						<p class="mt-2 text-sm text-gray-500">
							{tutor.faculty || 'ยังไม่ระบุคณะ'} • ปี {tutor.academic_year || '-'}
						</p>

						<div class="mt-6 inline-block rounded-2xl bg-[#f0faff] px-6 py-3">
							<p class="text-sm text-gray-500">ค่าสอนเริ่มต้น</p>
							<p class="text-2xl font-black text-[#02c2ff]">
								฿{tutor.price_per_hour}<span class="text-base font-normal text-gray-500">
									/ ชม.</span
								>
							</p>
						</div>

						{#if tutor.bio}
							<div class="mt-8 text-left">
								<p class="text-sm font-bold text-gray-900">แนะนำตัว</p>
								<p class="mt-2 text-sm leading-relaxed text-gray-600">{tutor.bio}</p>
							</div>
						{/if}
					</div>
				</div>

				<div class="space-y-8 lg:col-span-2">
					<div class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
						<div class="mb-6 flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="h-6 w-6"
									><path
										d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c1.68 0 3.282.466 4.75 1.257a.75.75 0 0 0 1-.707V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z"
									/></svg
								>
							</div>
							<h2 class="text-xl font-bold text-gray-900">วิชาที่รับสอน</h2>
						</div>
						<div class="flex flex-wrap gap-3">
							{#if tutor.subjects && tutor.subjects.length > 0}
								{#each tutor.subjects as sub}
									<span
										class="rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200"
									>
										{sub}
									</span>
								{/each}
							{:else}
								<p class="text-sm text-gray-500">ติวเตอร์ยังไม่ได้เพิ่มวิชาที่สอน</p>
							{/if}
						</div>
					</div>

					<div
						class="relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg ring-1 shadow-[#02c2ff]/5 ring-gray-100"
					>
						<div
							class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#02c2ff] opacity-[0.03]"
						></div>

						<div class="relative z-10 mb-8 flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f9ff] text-[#02c2ff]"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="h-6 w-6"
									><path
										d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.158 3.71 3.71 1.159-1.157a2.625 2.625 0 0 0 0-3.711ZM16.519 5.655l-4.225 4.224-2.185-1.093a.75.75 0 0 0-1.042.27l-1.748 3.033-1.04-.52a.75.75 0 0 0-1.043.271l-1.484 2.571a.75.75 0 0 0 .204.996l3.52 2.64A2.25 2.25 0 0 0 9.278 18h1.242a.75.75 0 0 0 .617-.323l4.568-6.527a.75.75 0 0 0-.25-1.06l-1.092-.547 4.224-4.224-2.068-2.068ZM5.25 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H6v15h12v-1.5a.75.75 0 0 1 1.5 0v2.25a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-18Z"
									/></svg
								>
							</div>
							<h2 class="text-2xl font-bold text-gray-900">จองเวลาเรียน</h2>
						</div>

						<form onsubmit={handleBook} class="relative z-10 space-y-8">
							<div>
								<!-- svelte-ignore a11y_label_has_associated_control -->
								<label class="mb-3 block text-sm font-bold text-gray-700"
									>1. เลือกวิชาที่ต้องการเรียน</label
								>
								<div class="flex flex-wrap gap-3">
									{#each tutor.subjects as sub}
										<button
											type="button"
											onclick={() => (selectedSubject = sub)}
											class="rounded-xl px-5 py-3 text-sm font-medium transition-all {selectedSubject ===
											sub
												? 'bg-[#02c2ff] text-white shadow-md ring-1 shadow-[#02c2ff]/30 ring-[#02c2ff]'
												: 'bg-slate-50 text-gray-600 ring-1 ring-gray-200 hover:bg-slate-100'}"
										>
											{sub}
										</button>
									{/each}
								</div>
							</div>

							<div>
								<!-- svelte-ignore a11y_label_has_associated_control -->
								<label class="mb-3 block text-sm font-bold text-gray-700"
									>2. เลือกเวลาที่สะดวก</label
								>
								{#if availability.length > 0}
									<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
										{#each availability as slot}
											<button
												type="button"
												onclick={() => (selectedSlot = slot)}
												class="flex flex-col items-start rounded-xl p-4 transition-all {selectedSlot ===
												slot
													? 'bg-[#f0faff] ring-2 ring-[#02c2ff]'
													: 'bg-slate-50 ring-1 ring-gray-200 hover:bg-slate-100'}"
											>
												<span class="font-bold text-gray-900">วัน{slot.day_of_week}</span>
												<span class="mt-1 text-sm text-gray-500">
													⏰ {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)} น.
												</span>
											</button>
										{/each}
									</div>
								{:else}
									<p class="rounded-xl bg-red-50 p-4 text-sm text-red-500">
										ติวเตอร์ยังไม่ได้เพิ่มเวลาว่างครับ
									</p>
								{/if}
							</div>

							<div>
								<!-- svelte-ignore a11y_label_has_associated_control -->
								<label class="mb-3 block text-sm font-bold text-gray-700"
									>3. ข้อความเพิ่มเติมถึงติวเตอร์ (ถ้ามี)</label
								>
								<textarea
									bind:value={bookingNote}
									placeholder="เช่น อยากเน้นเรื่องอะไรเป็นพิเศษ, นัดเจอกันที่ไหนดี..."
									class="w-full rounded-2xl border border-gray-200 bg-slate-50 p-4 transition-all outline-none placeholder:text-gray-400 focus:border-[#02c2ff] focus:bg-white focus:ring-4 focus:ring-[#02c2ff]/10"
									rows="3"
								></textarea>
							</div>

							<button
								type="submit"
								class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#02c2ff] py-4 text-lg font-bold text-white shadow-lg shadow-[#02c2ff]/30 transition-all hover:bg-[#13b5e8] hover:shadow-[#02c2ff]/40 active:scale-[0.98]"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="h-6 w-6"
									><path
										d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z"
									/></svg
								>
								ส่งคำขอจองเวลาเรียน
							</button>
						</form>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

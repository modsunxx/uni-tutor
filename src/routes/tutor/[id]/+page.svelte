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
			alert('กรุณาเลือกวิชาและเวลา');
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
			alert('🎉 ส่งคำขอจองสำเร็จ!');
			selectedSubject = '';
			selectedSlot = null;
			bookingNote = '';
		}
	};
</script>

<div class="flex min-h-screen flex-col bg-slate-50">
	<Navbar />
	<main class="mx-auto w-full max-w-5xl grow px-4 py-10">
		<a href="/home" class="mb-6 inline-flex text-sm text-gray-500 hover:text-[#02c2ff]"
			>← กลับไปหน้าหลัก</a
		>
		{#if loading}
			<p class="py-20 text-center">⏳ กำลังโหลดโปรไฟล์...</p>
		{:else if tutor}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				<div class="rounded-2xl border bg-white p-6 text-center md:col-span-1">
					<img
						src={tutor.profiles?.avatar_url ||
							`https://ui-avatars.com/api/?name=${tutor.profiles?.full_name}`}
						alt="Tutor"
						class="mx-auto h-32 w-32 rounded-full border-4"
					/>
					<h1 class="mt-4 text-2xl font-bold">{tutor.profiles?.full_name}</h1>
					<p class="mt-2 text-xl font-bold text-[#02c2ff]">฿{tutor.price_per_hour}/ชม.</p>
				</div>
				<div class="space-y-6 md:col-span-2">
					<div class="rounded-2xl border bg-white p-6">
						<h2 class="mb-4 text-xl font-bold">📚 วิชาที่สอน</h2>
						<div class="flex gap-2">
							{#each tutor.subjects as sub}<span
									class="rounded bg-[#f0faff] px-3 py-1 text-[#02c2ff]">{sub}</span
								>{/each}
						</div>
					</div>
					<div class="rounded-2xl border border-[#9ae7ff] bg-white p-6">
						<h2 class="mb-4 text-2xl font-bold">📝 จองเวลาเรียน</h2>
						<form onsubmit={handleBook} class="space-y-4">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="font-bold">เลือกวิชา</label><br />
							{#each tutor.subjects as sub}<button
									type="button"
									onclick={() => (selectedSubject = sub)}
									class="m-1 rounded border px-4 py-2 {selectedSubject === sub
										? 'bg-[#02c2ff] text-white'
										: ''}">{sub}</button
								>{/each}
							<br /><br />
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="font-bold">เลือกเวลา</label><br />
							{#each availability as slot}<button
									type="button"
									onclick={() => (selectedSlot = slot)}
									class="m-1 w-full rounded border px-4 py-2 text-left {selectedSlot === slot
										? 'border-[#02c2ff] text-[#02c2ff]'
										: ''}"
									>วัน{slot.day_of_week}
									{slot.start_time.substring(0, 5)}-{slot.end_time.substring(0, 5)}</button
								>{/each}
							<br /><br />
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="font-bold">ข้อความเพิ่มเติม</label>
							<textarea bind:value={bookingNote} class="w-full rounded border p-2" rows="2"
							></textarea>
							<button type="submit" class="w-full rounded bg-gray-900 py-3 font-bold text-white"
								>🚀 ยืนยันการจอง</button
							>
						</form>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

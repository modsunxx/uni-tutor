<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import SearchFilter from '$lib/components/SearchFilter.svelte';
	import TutorCard from '$lib/components/TutorCard.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	let loading = $state(true);
	let searchQuery = $state('');
	let selectedFaculty = $state('ทั้งหมด');

	let allTutors = $state<any[]>([]);

	const faqs = [
		{
			q: 'ระบบจับคู่อัจฉริยะ (Smart-Matching) คืออะไร?',
			a: 'ระบบวิเคราะห์ความต้องการ งบประมาณ และเวลาว่าง เพื่อแนะนำติวเตอร์ที่เหมาะสมที่สุด'
		},
		{
			q: 'การชำระเงินค่าเรียนทำอย่างไร?',
			a: 'สามารถตกลงช่องทางการชำระเงินกันเองได้โดยตรงผ่านการแชทครับ'
		},
		{
			q: 'ใครสามารถสมัครเป็นติวเตอร์ได้บ้าง?',
			a: 'นักศึกษาปัจจุบันของ มทร.ตะวันออก วิทยาเขตบางพระ ทุกชั้นปี ที่มีอีเมล @rmutto.ac.th'
		},
		{
			q: 'เรียนที่ไหน?',
			a: 'สามารถนัดหมายสถานที่เรียนกันเองได้เลย หรือเรียนออนไลน์ผ่าน Google Meet ก็ได้'
		}
	];

	onMount(async () => {
		loading = true;
		const { data } = await supabase
			.from('tutor_profiles')
			.select('*, profiles(*)')
			.order('rating', { ascending: false });
		allTutors = data || [];
		loading = false;
	});

	let filteredTutors = $derived(
		allTutors.filter((tutor) => {
			const searchLower = searchQuery.toLowerCase();
			const matchSearch =
				tutor.profiles?.full_name?.toLowerCase().includes(searchLower) ||
				'' ||
				tutor.subjects.some((s: string) => s.toLowerCase().includes(searchLower)) ||
				tutor.faculty.toLowerCase().includes(searchLower) ||
				tutor.major.toLowerCase().includes(searchLower);
			const matchFaculty = selectedFaculty === 'ทั้งหมด' || tutor.faculty.includes(selectedFaculty);
			return matchSearch && matchFaculty;
		})
	);
</script>

<div class="flex min-h-screen flex-col bg-slate-50">
	<Navbar />
	<main class="grow px-4 py-10 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-5xl">
			<div class="mb-10 flex flex-col items-center text-center md:items-start md:text-left">
				<span
					class="mb-3 inline-flex items-center rounded-full bg-[#ccf3ff] px-3 py-1 text-xs font-bold text-[#02c2ff] ring-1 ring-[#67daff] ring-inset"
					>📍 RMUTTO วิทยาเขตบางพระ</span
				>
				<h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
					แหล่งรวมติวเตอร์ <span class="text-[#02c2ff]">พี่สอนน้อง</span>
				</h1>
				<p class="mt-3 text-lg text-gray-500">
					มทร.ตะวันออก บางพระ แลกเปลี่ยนทักษะกันในรั้วมหาวิทยาลัย
				</p>
			</div>

			<SearchFilter bind:searchQuery bind:selectedFaculty />
			<p class="mb-4 text-sm font-medium text-gray-500">
				พบเพื่อนติวเตอร์ <span class="font-bold text-[#02c2ff]">{filteredTutors.length}</span> คน
			</p>

			{#if loading}
				<div class="animate-pulse py-10 text-center text-gray-500">
					⏳ กำลังค้นหาติวเตอร์จากฐานข้อมูล...
				</div>
			{:else if filteredTutors.length > 0}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredTutors as tutor (tutor.tutor_id)}
						<TutorCard {tutor} />
					{/each}
				</div>
			{:else}
				<div
					class="rounded-2xl border-2 border-dashed border-[#9ae7ff] bg-white py-16 text-center text-gray-500"
				>
					<div class="mb-4 text-5xl">🔍</div>
					<p class="text-lg font-medium text-gray-900">ไม่พบเพื่อนติวเตอร์</p>
					<p class="mt-1 text-sm text-gray-500">
						ติวเตอร์อาจจะยังไม่ได้สร้างโปรไฟล์ หรือลองเปลี่ยนคำค้นหาดูนะครับ
					</p>
				</div>
			{/if}
		</div>
	</main>

	<section class="border-t border-gray-200 bg-white py-16">
		<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
			<div class="mb-10 text-center">
				<h2 class="text-2xl font-extrabold text-gray-900 sm:text-3xl">คำถามที่พบบ่อย (FAQ)</h2>
			</div>
			<div class="space-y-4">
				{#each faqs as faq}
					<div
						class="rounded-2xl border border-gray-100 bg-slate-50 p-6 shadow-sm transition-colors hover:border-[#9ae7ff] hover:bg-[#f0faff]"
					>
						<h3 class="flex items-start gap-3 text-lg font-bold text-gray-900">
							<span class="text-[#02c2ff]">Q:</span>{faq.q}
						</h3>
						<p class="mt-2 pl-8 leading-relaxed text-gray-600">{faq.a}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>
</div>

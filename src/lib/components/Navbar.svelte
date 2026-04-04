<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let session = $state<any>(null);
	let userEmail = $state('');
	let profileRole = $state('student');
	let avatarUrl = $state('');

	// 🌟 1. เพิ่มตัวแปรเช็คการเปิด/ปิดเมนูในมือถือ
	let isMobileMenuOpen = $state(false);

	const loadUserData = async (currentSession: any) => {
		userEmail = currentSession.user.email || '';
		const { data: profileData } = await supabase
			.from('profiles')
			.select('role, avatar_url')
			.eq('id', currentSession.user.id)
			.single();

		if (profileData) {
			profileRole = profileData.role;
			avatarUrl = profileData.avatar_url || '';
		}
	};

	onMount(() => {
		supabase.auth.getSession().then(({ data }) => {
			session = data.session;
			if (session) loadUserData(session);
		});

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			session = _session;
			if (session) {
				loadUserData(session);
			} else {
				userEmail = '';
				profileRole = 'student';
				avatarUrl = '';
			}
		});

		return () => subscription.unsubscribe();
	});

	// 🌟 2. ให้ปิดเมนูมือถืออัตโนมัติเวลาเรากดเปลี่ยนหน้าเว็บ
	$effect(() => {
		const currentPath = $page.url.pathname; // จับใส่ตัวแปรให้ Linter สบายใจ
		isMobileMenuOpen = false;
	});

	const handleLogout = async () => {
		if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
			await supabase.auth.signOut();
			await goto('/');
		}
	};
</script>

<nav
	class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 shadow-sm backdrop-blur-md transition-all"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="relative flex h-16 items-center justify-between">
			<div class="z-10 flex items-center gap-3">
				<button
					onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-gray-600 transition-colors hover:bg-slate-100 md:hidden"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-6 w-6"
					>
						{#if isMobileMenuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
							/>
						{/if}
					</svg>
				</button>

				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#02c2ff] text-white shadow-md"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="h-6 w-6"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
						/></svg
					>
				</div>
				<span class="hidden text-lg font-extrabold tracking-tight text-gray-900 sm:block"
					>Tutor<span class="text-[#02c2ff]">RMUTTO</span></span
				>
			</div>

			<div
				class="absolute top-1/2 left-1/2 hidden w-max -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex"
			>
				<a
					href="/home"
					class="py-5 text-sm font-bold transition-colors {$page.url.pathname === '/home'
						? 'border-b-2 border-[#02c2ff] text-[#02c2ff]'
						: 'text-gray-500 hover:text-[#02c2ff]'}">หน้าหลัก</a
				>
				<a
					href="/smart-matching"
					class="py-5 text-sm font-bold transition-colors {$page.url.pathname === '/smart-matching'
						? 'border-b-2 border-[#02c2ff] text-[#02c2ff]'
						: 'text-gray-500 hover:text-[#02c2ff]'}">⚡ จับคู่อัจฉริยะ</a
				>
				{#if profileRole === 'tutor'}
					<a
						href="/dashboard"
						class="py-5 text-sm font-bold transition-colors {$page.url.pathname === '/dashboard'
							? 'border-b-2 border-[#02c2ff] text-[#02c2ff]'
							: 'text-gray-500 hover:text-[#02c2ff]'}">📊 แดชบอร์ดติวเตอร์</a
					>
				{/if}
			</div>

			<div class="z-10 ml-auto flex items-center gap-4">
				{#if session}
					<a
						href="/profile"
						class="hidden items-center gap-2 border-r border-gray-200 pr-4 text-sm font-medium text-gray-600 transition-colors hover:text-[#02c2ff] sm:flex"
					>
						{#if avatarUrl}
							<img
								src={avatarUrl}
								alt="User"
								class="h-8 w-8 rounded-full border border-gray-200 object-cover"
							/>
						{:else}
							<div
								class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-slate-100 text-gray-400"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="mt-2 h-6 w-6"
									><path
										fill-rule="evenodd"
										d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
										clip-rule="evenodd"
									/></svg
								>
							</div>
						{/if}
						<span class="font-bold">ตั้งค่าบัญชี</span>
					</a>
					<button
						onclick={handleLogout}
						class="rounded-lg bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100"
						>ออกจากระบบ</button
					>
				{:else}
					<a
						href="/"
						class="rounded-lg bg-[#02c2ff] px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-[#35ceff]"
						>เข้าสู่ระบบ</a
					>
				{/if}
			</div>
		</div>
	</div>

	{#if isMobileMenuOpen}
		<div
			class="absolute top-16 left-0 w-full border-b border-gray-100 bg-white shadow-lg md:hidden"
		>
			<div class="flex flex-col space-y-1 px-4 pt-2 pb-6">
				<a
					href="/home"
					class="block rounded-xl px-4 py-3 text-sm font-bold transition-colors {$page.url
						.pathname === '/home'
						? 'bg-[#e6f9ff] text-[#02c2ff]'
						: 'text-gray-600 hover:bg-slate-50'}">หน้าหลัก</a
				>
				<a
					href="/smart-matching"
					class="block rounded-xl px-4 py-3 text-sm font-bold transition-colors {$page.url
						.pathname === '/smart-matching'
						? 'bg-[#e6f9ff] text-[#02c2ff]'
						: 'text-gray-600 hover:bg-slate-50'}">⚡ จับคู่อัจฉริยะ</a
				>

				{#if profileRole === 'tutor'}
					<a
						href="/dashboard"
						class="block rounded-xl px-4 py-3 text-sm font-bold transition-colors {$page.url
							.pathname === '/dashboard'
							? 'bg-[#e6f9ff] text-[#02c2ff]'
							: 'text-gray-600 hover:bg-slate-50'}">📊 แดชบอร์ดติวเตอร์</a
					>
				{/if}

				{#if session}
					<div class="my-2 border-t border-gray-100"></div>
					<a
						href="/profile"
						class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-slate-50"
					>
						⚙️ ตั้งค่าบัญชี
					</a>
				{/if}
			</div>
		</div>
	{/if}
</nav>

<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	let loading = $state(true);
	let saving = $state(false);
	let email = $state('');
	let fullName = $state('');
	let phone = $state('');
	let userRole = $state('student');

	let currentAvatarUrl = $state('');
	let selectedFile = $state<File | null>(null);
	let avatarPreviewUrl = $state('');
	let fileInput = $state<HTMLInputElement>();

	onMount(async () => {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) {
			goto('/');
			return;
		}
		const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
		if (data) {
			email = data.email;
			fullName = data.full_name || '';
			phone = data.phone || '';
			userRole = data.role || 'student';
			currentAvatarUrl = data.avatar_url || '';
		}
		loading = false;
	});

	onDestroy(() => {
		if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
	});

	const handleFileChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) {
			selectedFile = null;
			return;
		}

		const file = input.files[0];

		// 🌟 ดักจับขนาดไฟล์: ตรวจสอบว่าไฟล์ใหญ่เกิน 2MB หรือไม่ (1MB = 1024 * 1024 bytes)
		const maxSizeInBytes = 2 * 1024 * 1024;
		if (file.size > maxSizeInBytes) {
			alert('ไฟล์รูปภาพมีขนาดใหญ่เกินไปครับ (ต้องไม่เกิน 2MB) กรุณาเลือกรูปใหม่นะครับ');
			input.value = ''; // ล้างค่าในช่อง input
			selectedFile = null;
			return;
		}

		selectedFile = file;
		if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
		avatarPreviewUrl = URL.createObjectURL(selectedFile);
	};

	const handleUpdate = async () => {
		saving = true;
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) return;

		let finalAvatarUrl = currentAvatarUrl;
		if (selectedFile) {
			const fileExt = selectedFile.name.split('.').pop();
			const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
			const { error } = await supabase.storage
				.from('avatars')
				.upload(`avatars/${fileName}`, selectedFile, { upsert: true });
			if (error) {
				alert('อัปโหลดรูปไม่สำเร็จ: ' + error.message);
				saving = false;
				return;
			}
			const {
				data: { publicUrl }
			} = supabase.storage.from('avatars').getPublicUrl(`avatars/${fileName}`);
			finalAvatarUrl = publicUrl;
		}

		const { error } = await supabase
			.from('profiles')
			.update({ full_name: fullName, phone, avatar_url: finalAvatarUrl })
			.eq('id', session.user.id);
		if (error) alert('บันทึกไม่สำเร็จ: ' + error.message);
		else {
			alert('💾 บันทึกข้อมูลสำเร็จ');
			window.location.reload();
		}
		saving = false;
	};
</script>

<div class="flex min-h-screen flex-col bg-slate-50">
	<nav class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
			<a href="/home" class="font-bold text-[#02c2ff] transition-colors hover:text-[#35ceff]"
				>← กลับหน้าหลัก</a
			>
			<span class="font-bold text-gray-900">ตั้งค่าบัญชี</span>
			<div class="w-24"></div>
		</div>
	</nav>

	<main class="mx-auto w-full max-w-xl grow p-6">
		{#if loading}
			<p class="animate-pulse py-20 text-center text-gray-500">⏳ กำลังโหลด...</p>
		{:else}
			<div class="relative z-10 mt-4 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
				<div class="relative z-10 flex flex-col items-center gap-3 border-b border-gray-100 pb-8">
					{#if avatarPreviewUrl || currentAvatarUrl}
						<img
							src={avatarPreviewUrl || currentAvatarUrl}
							alt="Avatar"
							class="h-28 w-28 rounded-full border-4 border-[#ccf3ff] object-cover shadow-sm"
						/>
					{:else}
						<div
							class="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#ccf3ff] bg-slate-100 text-gray-400 shadow-sm"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="mt-4 h-16 w-16"
							>
								<path
									fill-rule="evenodd"
									d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					{/if}

					<input
						type="file"
						accept="image/jpeg, image/png, image/webp"
						class="hidden"
						bind:this={fileInput}
						onchange={handleFileChange}
					/>

					<button
						onclick={() => fileInput?.click()}
						class="mt-2 rounded-full bg-[#ccf3ff] px-4 py-2 text-sm font-bold text-[#02c2ff] transition-colors hover:bg-[#9ae7ff]"
					>
						📸 เลือกรูปโปรไฟล์ใหม่
					</button>

					<p class="text-xs font-medium text-gray-400">รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 2MB</p>

					{#if selectedFile}
						<p class="rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
							✅ เลือกไฟล์แล้ว: {selectedFile.name}
						</p>
					{/if}
				</div>

				<div class="mt-8 space-y-5">
					<div>
						<label class="mb-1 block text-sm font-bold text-gray-700">ชื่อ-นามสกุลจริง</label>
						<input
							type="text"
							bind:value={fullName}
							class="w-full rounded-xl border border-gray-200 bg-slate-50 p-3.5 transition-colors focus:border-[#02c2ff] focus:bg-white focus:ring-[#02c2ff]"
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-bold text-gray-700">เบอร์โทรศัพท์</label>
						<input
							type="tel"
							bind:value={phone}
							class="w-full rounded-xl border border-gray-200 bg-slate-50 p-3.5 transition-colors focus:border-[#02c2ff] focus:bg-white focus:ring-[#02c2ff]"
						/>
					</div>

					<div class="pt-4">
						<button
							onclick={handleUpdate}
							disabled={saving}
							class="w-full rounded-xl bg-gray-900 py-4 font-bold text-white shadow-md transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{saving ? '⏳ กำลังอัปโหลดและบันทึก...' : '💾 บันทึกการตั้งค่า'}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

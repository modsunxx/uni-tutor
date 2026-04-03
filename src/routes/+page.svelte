<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';

	let isLogin = $state(true);
	let isForgotPassword = $state(false);
	let loading = $state(false);

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let role = $state('student');

	let title = $state('นาย');
	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		if (!email.endsWith('@rmutto.ac.th') && !email.endsWith('@student.rmutto.ac.th')) {
			alert('กรุณาใช้อีเมล @rmutto.ac.th หรือ @student.rmutto.ac.th ของมหาวิทยาลัยเท่านั้นครับ');
			return;
		}

		loading = true;

		if (isForgotPassword) {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`
			});
			if (error) {
				alert('เกิดข้อผิดพลาด: ' + error.message);
			} else {
				alert('✅ ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว กรุณาเช็คกล่องจดหมายครับ');
				isForgotPassword = false;
			}
		} else if (isLogin) {
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) alert('เข้าสู่ระบบไม่สำเร็จ: อีเมลหรือรหัสผ่านไม่ถูกต้อง');
			else await goto('/home');
		} else {
			// 🌟 ตรวจสอบเบอร์โทรด้วย JavaScript แทน HTML 🌟
			if (!/^0[689]\d{8}$/.test(phone)) {
				alert('❌ กรุณากรอกเบอร์มือถือให้ถูกต้อง (10 หลัก เริ่มต้นด้วย 06, 08 หรือ 09)');
				loading = false;
				return;
			}

			if (password !== confirmPassword) {
				alert('❌ รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับ');
				loading = false;
				return;
			}

			const fullName = `${title}${firstName} ${lastName}`.trim();
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: { data: { role, full_name: fullName, phone } }
			});

			if (error) {
				alert('สมัครสมาชิกไม่สำเร็จ: ' + error.message);
			} else {
				if (data.user && data.user.identities && data.user.identities.length === 0) {
					alert('⚠️ อีเมลนี้มีในระบบแล้วครับ กรุณาเข้าสู่ระบบได้เลย');
				} else {
					alert(`✅ สร้างบัญชีใหม่สำเร็จ! กรุณาเช็คอีเมลเพื่อยืนยันตัวตนครับ`);
					isLogin = true;
					password = '';
					confirmPassword = '';
				}
			}
		}
		loading = false;
	};

	const toggleMode = () => {
		isLogin = !isLogin;
		isForgotPassword = false;
		email = '';
		password = '';
		confirmPassword = '';
		firstName = '';
		lastName = '';
		phone = '';
		showPassword = false;
		showConfirmPassword = false;
	};
</script>

<main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
	<div
		class="w-full max-w-md space-y-8 rounded-3xl border border-gray-100 bg-white p-10 shadow-xl transition-all"
	>
		<div class="text-center">
			<div
				class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#02c2ff] text-white shadow-lg shadow-[#02c2ff]/30"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="h-10 w-10"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
					/>
				</svg>
			</div>
			<h2 class="mt-6 text-3xl font-extrabold text-gray-900">
				{#if isForgotPassword}
					รีเซ็ตรหัสผ่าน
				{:else if isLogin}
					เข้าสู่ระบบ
				{:else}
					สมัครสมาชิก
				{/if}
			</h2>
			<p class="mt-2 text-sm text-gray-500">
				แพลตฟอร์มพี่สอนน้อง <span class="font-bold text-[#02c2ff]">RMUTTO บางพระ</span>
			</p>
		</div>

		<form class="mt-8 space-y-5" onsubmit={handleSubmit}>
			{#if !isLogin && !isForgotPassword}
				<div class="mb-6 flex rounded-xl bg-slate-100 p-1">
					<button
						type="button"
						onclick={() => (role = 'student')}
						class="w-1/2 rounded-lg py-2.5 text-sm font-bold transition-all {role === 'student'
							? 'bg-white text-[#02c2ff] shadow-sm'
							: 'text-gray-500 hover:text-gray-700'}">👨‍🎓 หาคนสอน</button
					>
					<button
						type="button"
						onclick={() => (role = 'tutor')}
						class="w-1/2 rounded-lg py-2.5 text-sm font-bold transition-all {role === 'tutor'
							? 'bg-[#02c2ff] text-white shadow-sm'
							: 'text-gray-500 hover:text-gray-700'}">👨‍🏫 สมัครติวเตอร์</button
					>
				</div>
				<div class="flex gap-2">
					<select
						bind:value={title}
						class="w-1/3 rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900"
					>
						<option value="นาย">นาย</option>
						<option value="นางสาว">นางสาว</option>
						<option value="นาง">นาง</option>
					</select>
					<input
						type="text"
						required
						bind:value={firstName}
						class="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02c2ff] focus:ring-[#02c2ff]"
						placeholder="ชื่อจริง"
					/>
				</div>
				<div>
					<input
						type="text"
						required
						bind:value={lastName}
						class="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02c2ff] focus:ring-[#02c2ff]"
						placeholder="นามสกุลจริง"
					/>
				</div>
				<div>
					<input
						type="tel"
						required
						bind:value={phone}
						class="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02c2ff] focus:ring-[#02c2ff]"
						placeholder="เบอร์โทรศัพท์มือถือ 10 หลัก"
						maxlength="10"
						oninput={(e) => (phone = e.currentTarget.value.replace(/[^0-9]/g, ''))}
					/>
				</div>
			{/if}

			<div>
				<input
					type="email"
					required
					bind:value={email}
					class="block w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02c2ff] focus:ring-[#02c2ff]"
					placeholder="อีเมล @rmutto.ac.th"
				/>
			</div>

			{#if !isForgotPassword}
				<div class="relative">
					{#if isLogin}
						<div class="mb-1 flex justify-end">
							<button
								type="button"
								onclick={() => (isForgotPassword = true)}
								class="text-xs font-bold text-[#02c2ff] transition-colors hover:text-[#35ceff]"
								>ลืมรหัสผ่าน?</button
							>
						</div>
					{/if}
					<div class="relative">
						<input
							type={showPassword ? 'text' : 'password'}
							required
							bind:value={password}
							class="block w-full rounded-xl border border-gray-300 py-3 pr-16 pl-4 outline-none focus:border-[#02c2ff] focus:ring-[#02c2ff]"
							placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
							minlength="6"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-4 text-sm font-bold text-gray-400 transition-colors hover:text-[#02c2ff]"
							onclick={() => (showPassword = !showPassword)}
						>
							{showPassword ? 'ซ่อน' : 'แสดง'}
						</button>
					</div>
				</div>

				{#if !isLogin}
					<div class="relative">
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							required
							bind:value={confirmPassword}
							class="block w-full rounded-xl border border-gray-300 py-3 pr-16 pl-4 outline-none focus:border-[#02c2ff] focus:ring-[#02c2ff]"
							placeholder="ยืนยันรหัสผ่าน"
							minlength="6"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-4 text-sm font-bold text-gray-400 transition-colors hover:text-[#02c2ff]"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
						>
							{showConfirmPassword ? 'ซ่อน' : 'แสดง'}
						</button>
					</div>
				{/if}
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="mt-4 w-full rounded-xl bg-[#02c2ff] px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#35ceff] disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if loading}
					กำลังดำเนินการ...
				{:else if isForgotPassword}
					✉️ ส่งลิงก์รีเซ็ตรหัสผ่าน
				{:else if isLogin}
					เข้าสู่ระบบ
				{:else}
					สร้างบัญชีใหม่
				{/if}
			</button>
		</form>

		<div class="mt-4 text-center">
			{#if isForgotPassword}
				<button
					type="button"
					onclick={() => (isForgotPassword = false)}
					class="text-sm font-medium text-gray-500 hover:text-gray-700"
					>← กลับไปหน้าเข้าสู่ระบบ</button
				>
			{:else}
				<button
					type="button"
					onclick={toggleMode}
					class="text-sm font-medium text-gray-500 hover:text-[#02c2ff]"
				>
					{isLogin ? 'ยังไม่มีบัญชีใช่ไหม? สมัครสมาชิกเลย' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
				</button>
			{/if}
		</div>
	</div>
</main>

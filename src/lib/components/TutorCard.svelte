<script lang="ts">
	// ================== Type สำหรับข้อมูลจริงจาก DB ==================
	type Tutor = {
		tutor_id: string; // uuid จาก tutor_profiles
		faculty: string;
		major: string;
		subjects: string[];
		price_per_hour: number;
		rating: number;
		profiles: {
			// ข้อมูล joined profiles
			full_name: string;
			avatar_url: string;
		};
	};

	let { tutor } = $props<{ tutor: Tutor }>();

	const getFacultyColor = (faculty: string) => {
		if (faculty.includes('เกษตร')) return 'bg-green-100 text-green-800 border-green-200';
		if (faculty.includes('มนุษย')) return 'bg-purple-100 text-purple-800 border-purple-200';
		if (faculty.includes('วิทยาศาสตร์และเทคโนโลยี'))
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		if (faculty.includes('สัตวแพทย์')) return 'bg-sky-100 text-sky-800 border-sky-200';
		if (faculty.includes('วิศวกรรม')) return 'bg-blue-900 text-white border-blue-950';
		if (faculty.includes('นวัตกรรมการศึกษา')) return 'bg-blue-100 text-blue-800 border-blue-200';
		return 'bg-gray-100 text-gray-800 border-gray-200';
	};

	// สร้าง URL สำหรับรูปโปรไฟล์ (ถ้าไม่มีใช้ Avatar จำลอง)
	const getAvatarUrl = (tutor: Tutor) => {
		if (tutor.profiles.avatar_url) return tutor.profiles.avatar_url;
		const nameForAvatar = tutor.profiles.full_name || 'Tutor';
		return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=02c2ff&color=fff`;
	};
</script>

<div
	class="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all hover:-translate-y-1 hover:border-[#67daff] hover:shadow-xl"
>
	<div class="p-5">
		<div class="flex items-start gap-4">
			<img
				src={getAvatarUrl(tutor)}
				alt={tutor.profiles.full_name || 'ติวเตอร์'}
				class="h-16 w-16 shrink-0 rounded-full border-2 border-[#9ae7ff] object-cover shadow-sm"
			/>
			<div class="flex flex-col gap-1">
				<h3 class="text-lg font-bold text-gray-900 transition-colors group-hover:text-[#02c2ff]">
					{tutor.profiles.full_name || 'ยังไม่ได้ตั้งชื่อ'}
				</h3>
				<span
					class="inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold {getFacultyColor(
						tutor.faculty
					)}"
				>
					{tutor.faculty}
				</span>
				<p class="mt-0.5 line-clamp-1 text-xs text-gray-500" title={tutor.major}>{tutor.major}</p>
			</div>
		</div>

		<div class="mt-4 flex flex-wrap gap-2">
			{#each tutor.subjects as subject}
				<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
					{subject}
				</span>
			{/each}
		</div>
	</div>

	<div class="mt-auto">
		<div class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
			<div class="flex flex-col">
				<span class="text-xs text-gray-500">เรทเริ่มต้น</span>
				<span class="text-lg font-bold text-[#02c2ff]"
					>฿{tutor.price_per_hour}<span class="text-sm font-normal text-gray-500">/ชม.</span></span
				>
			</div>
			<div class="flex items-center gap-1 font-medium text-amber-500">
				⭐ {tutor.rating.toFixed(1)}
			</div>
		</div>

		<a
			href={`/tutor/${tutor.tutor_id}`}
			class="block w-full bg-[#02c2ff] py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#35ceff]"
		>
			ดูโปรไฟล์ และจองเวลา
		</a>
	</div>
</div>

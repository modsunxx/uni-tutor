<script lang="ts">
	let { searchQuery = $bindable(''), selectedFaculty = $bindable('ทั้งหมด') } = $props();

	const faculties = [
		{ label: 'ทั้งหมด', keyword: 'ทั้งหมด' },
		{ label: 'เกษตรฯ', keyword: 'เกษตรศาสตร์' },
		{ label: 'มนุษยฯ', keyword: 'มนุษยศาสตร์' },
		{ label: 'วิทยาศาสตร์ฯ', keyword: 'วิทยาศาสตร์และเทคโนโลยี' },
		{ label: 'สัตวแพทย์', keyword: 'สัตวแพทยศาสตร์' },
		{ label: 'วิศวกรรมฯ', keyword: 'วิศวกรรมศาสตร์' },
		{ label: 'นวัตกรรมฯ', keyword: 'นวัตกรรมการศึกษา' }
	];
</script>

<div class="mb-8 flex flex-col gap-4">
	<div class="relative w-full md:w-2/3 lg:w-1/2">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="ค้นหาวิชา, ชื่อสาขา หรือชื่อติวเตอร์..."
			class="w-full rounded-lg border-gray-300 py-3 pr-10 pl-4 shadow-sm focus:border-[#02c2ff] focus:ring-[#02c2ff]"
		/>
		<span class="absolute top-3 right-3 text-gray-400">🔍</span>
	</div>

	<div class="flex flex-wrap gap-2">
		{#each faculties as fav (fav)}
			<button
				onclick={() => (selectedFaculty = fav.keyword)}
				class="rounded-full px-4 py-2 text-sm font-medium transition-all {selectedFaculty ===
				fav.keyword
					? 'bg-[#02c2ff] text-white shadow-md'
					: 'border border-gray-200 bg-white text-gray-600 hover:bg-[#ccf3ff] hover:text-[#02c2ff]'}"
			>
				{fav.label}
			</button>
		{/each}
	</div>
</div>

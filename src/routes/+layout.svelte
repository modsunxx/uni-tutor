<script lang="ts">
	// ดึงไฟล์ CSS ให้ตรงกับชื่อไฟล์จริงในโปรเจกต์ของคุณ
	import './layout.css';

	let { children } = $props();
</script>

{@render children()}

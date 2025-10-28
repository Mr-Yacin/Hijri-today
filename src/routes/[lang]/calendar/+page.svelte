<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Card, Button } from '$lib/components';
</script>

<svelte:head>
	<title>{$_('common.calendar')} - Hijri Date Platform</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-2">
			{$_('common.calendar')}
		</h1>
		<p class="text-gray-600">
			{$_('months.hijri.5')} 1447
		</p>
	</div>
	
	<div class="max-w-4xl mx-auto">
		<Card title="" variant="default" padding="medium">
			<div class="calendar-placeholder text-center py-12">
				<div class="text-6xl mb-4">📅</div>
				<p class="text-gray-600">
					{$_('common.calendar')} - Coming Soon
				</p>
			</div>
		</Card>
	</div>
</div>
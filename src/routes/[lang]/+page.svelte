<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { currentLocale } from '$lib/i18n';
	import { DateDisplay, Card, Button } from '$lib/components';
</script>

<svelte:head>
	<title>{$_('common.today')} - Hijri Date Platform</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-2">
			{$_('dates.today_hijri')}
		</h1>
		<p class="text-gray-600">
			{$_('common.today')}
		</p>
	</div>
	
	<div class="max-w-2xl mx-auto">
		<Card title="" variant="primary" padding="large">
			<div class="text-center">
				<DateDisplay
					hijriDay={28}
					hijriMonth={5}
					hijriYear={1447}
					gregorianDay={28}
					gregorianMonth={10}
					gregorianYear={2025}
					size="large"
					showBoth={true}
				/>
				
				<div class="flex gap-4 justify-center mt-6 flex-wrap">
					<Button variant="primary" icon="📋">
						{$_('actions.copy_date')}
					</Button>
					<Button variant="outline" icon="📤">
						{$_('actions.share_date')}
					</Button>
					<Button variant="outline" icon="📅">
						{$_('actions.add_to_calendar')}
					</Button>
				</div>
			</div>
		</Card>
		
		<div class="mt-6 text-center text-sm text-gray-500">
			<p>{$_('common.method')}: Umm al-Qura</p>
			<p>{$_('common.country')}: Saudi Arabia</p>
		</div>
	</div>
</div>
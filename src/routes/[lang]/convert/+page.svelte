<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Card, Button } from '$lib/components';
</script>

<svelte:head>
	<title>{$_('common.convert')} - Hijri Date Platform</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-2">
			{$_('common.convert')}
		</h1>
		<p class="text-gray-600">
			{$_('dates.convert_to_hijri')} / {$_('dates.convert_to_gregorian')}
		</p>
	</div>
	
	<div class="max-w-4xl mx-auto">
		<div class="grid md:grid-cols-2 gap-6">
			<Card title={$_('dates.convert_to_hijri')} variant="default" padding="medium">
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							{$_('dates.gregorian')} {$_('dates.day')}
						</label>
						<input
							type="number"
							min="1"
							max="31"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="28"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							{$_('dates.gregorian')} {$_('dates.month')}
						</label>
						<select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
							<option value="10">{$_('months.gregorian.10')}</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							{$_('dates.gregorian')} {$_('dates.year')}
						</label>
						<input
							type="number"
							min="1900"
							max="2100"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="2025"
						/>
					</div>
					<Button variant="primary" size="medium">
						{$_('dates.convert_to_hijri')}
					</Button>
				</div>
			</Card>

			<Card title={$_('dates.convert_to_gregorian')} variant="default" padding="medium">
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							{$_('dates.hijri')} {$_('dates.day')}
						</label>
						<input
							type="number"
							min="1"
							max="30"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="28"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							{$_('dates.hijri')} {$_('dates.month')}
						</label>
						<select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
							<option value="5">{$_('months.hijri.5')}</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							{$_('dates.hijri')} {$_('dates.year')}
						</label>
						<input
							type="number"
							min="1300"
							max="1500"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="1447"
						/>
					</div>
					<Button variant="primary" size="medium">
						{$_('dates.convert_to_gregorian')}
					</Button>
				</div>
			</Card>
		</div>
	</div>
</div>
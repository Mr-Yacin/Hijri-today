<script lang="ts">
	import { textDirection } from '$lib/i18n';

	export let title: string = '';
	export let variant: 'default' | 'primary' | 'secondary' = 'default';
	export let padding: 'small' | 'medium' | 'large' = 'medium';
	export let shadow: boolean = true;
	export let border: boolean = true;

	$: paddingClasses = {
		small: 'p-4',
		medium: 'p-6',
		large: 'p-8'
	};

	$: variantClasses = {
		default: 'bg-white',
		primary: 'bg-blue-50 border-blue-200',
		secondary: 'bg-gray-50 border-gray-200'
	};
</script>

<div
	class="card {paddingClasses[padding]} {variantClasses[variant]}"
	class:shadow-md={shadow}
	class:border={border}
	class:rounded-lg={true}
	dir={$textDirection}
>
	{#if title}
		<h3 class="card-title text-lg font-semibold mb-4 text-gray-900">
			{title}
		</h3>
	{/if}
	
	<div class="card-content">
		<slot />
	</div>
</div>

<style>
	.card {
		transition: all 0.2s ease;
		border-color: #e5e7eb;
	}

	.card:hover {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.card-title {
		margin-bottom: 1rem;
	}

	/* RTL text alignment */
	:global([dir="rtl"]) .card {
		text-align: right;
	}

	:global([dir="ltr"]) .card {
		text-align: left;
	}
</style>
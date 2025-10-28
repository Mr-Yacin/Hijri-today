<script lang="ts">
	import { textDirection } from '$lib/i18n';

	export let variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let disabled: boolean = false;
	export let loading: boolean = false;
	export let icon: string = '';
	export let iconPosition: 'left' | 'right' = 'left';
	export let type: 'button' | 'submit' | 'reset' = 'button';

	$: sizeClasses = {
		small: 'px-3 py-1.5 text-sm',
		medium: 'px-4 py-2 text-base',
		large: 'px-6 py-3 text-lg'
	};

	$: variantClasses = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
		secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
		outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
		ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
	};
</script>

<button
	{type}
	class="btn {sizeClasses[size]} {variantClasses[variant]}"
	class:opacity-50={disabled || loading}
	class:cursor-not-allowed={disabled}
	class:cursor-wait={loading}
	{disabled}
	dir={$textDirection}
	on:click
	{...$$restProps}
>
	{#if loading}
		<span class="loading-spinner" aria-hidden="true"></span>
	{:else if icon && iconPosition === 'left'}
		<span class="btn-icon btn-icon-left" aria-hidden="true">{icon}</span>
	{/if}
	
	<span class="btn-text">
		<slot />
	</span>
	
	{#if !loading && icon && iconPosition === 'right'}
		<span class="btn-icon btn-icon-right" aria-hidden="true">{icon}</span>
	{/if}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border-radius: 0.375rem;
		font-weight: 500;
		transition: all 0.2s ease;
		border: none;
		cursor: pointer;
	}

	.btn:focus {
		outline: 2px solid transparent;
		outline-offset: 2px;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}

	.btn:disabled {
		cursor: not-allowed;
	}

	.loading-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* RTL adjustments */
	:global([dir="rtl"]) .btn {
		flex-direction: row-reverse;
	}

	:global([dir="rtl"]) .btn-icon-left {
		order: 1;
	}

	:global([dir="rtl"]) .btn-icon-right {
		order: -1;
	}
</style>
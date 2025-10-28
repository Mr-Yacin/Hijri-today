<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { currentLocale, textDirection } from '$lib/i18n';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	$: currentPath = $page.url.pathname;
	$: basePath = `/${$currentLocale}`;

	const navItems = [
		{ key: 'today', path: '/today', icon: '📅' },
		{ key: 'convert', path: '/convert', icon: '🔄' },
		{ key: 'calendar', path: '/calendar', icon: '📆' }
	];

	function isActive(path: string): boolean {
		const fullPath = basePath + path;
		return currentPath === fullPath || (path === '' && currentPath === basePath);
	}
</script>

<nav class="navigation" dir={$textDirection} role="navigation" aria-label={$_('navigation.home')}>
	<div class="nav-container">
		<div class="nav-brand">
			<a href={basePath} class="brand-link">
				<span class="brand-icon">🌙</span>
				<span class="brand-text">Hijri Today</span>
			</a>
		</div>

		<div class="nav-menu">
			<ul class="nav-list" role="menubar">
				{#each navItems as item}
					<li class="nav-item" role="none">
						<a
							href={basePath + item.path}
							class="nav-link"
							class:active={isActive(item.path)}
							role="menuitem"
							aria-current={isActive(item.path) ? 'page' : undefined}
						>
							<span class="nav-icon" aria-hidden="true">{item.icon}</span>
							<span class="nav-text">{$_(`navigation.${item.key}`)}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="nav-actions">
			<LanguageSwitcher showLabels={false} />
		</div>
	</div>
</nav>

<style>
	.navigation {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4rem;
	}

	.nav-brand {
		flex-shrink: 0;
	}

	.brand-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: #1f2937;
		font-weight: 600;
		font-size: 1.25rem;
	}

	.brand-link:hover {
		color: #3b82f6;
	}

	.brand-icon {
		font-size: 1.5rem;
	}

	.nav-menu {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.nav-list {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 1rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: #6b7280;
		border-radius: 0.375rem;
		transition: all 0.2s ease;
		font-weight: 500;
	}

	.nav-link:hover {
		color: #3b82f6;
		background: #f3f4f6;
	}

	.nav-link.active {
		color: #3b82f6;
		background: #eff6ff;
	}

	.nav-link:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.nav-icon {
		font-size: 1.125rem;
	}

	.nav-actions {
		flex-shrink: 0;
	}

	/* RTL adjustments */
	:global([dir="rtl"]) .nav-container {
		flex-direction: row-reverse;
	}

	:global([dir="rtl"]) .nav-list {
		flex-direction: row-reverse;
	}

	:global([dir="rtl"]) .brand-link {
		flex-direction: row-reverse;
	}

	:global([dir="rtl"]) .nav-link {
		flex-direction: row-reverse;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.nav-container {
			padding: 0 0.5rem;
		}

		.nav-list {
			gap: 0.5rem;
		}

		.nav-text {
			display: none;
		}

		.nav-link {
			padding: 0.5rem;
		}

		.brand-text {
			display: none;
		}
	}
</style>
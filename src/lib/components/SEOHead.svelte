<script lang="ts">
	import type { SEOData } from '$lib/utils/seo';
	
	export let seo: SEOData;
	export let siteName = 'Hijri Date Platform';
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	
	{#if seo.canonical}
		<link rel="canonical" href={seo.canonical} />
	{/if}
	
	{#if seo.robots}
		<meta name="robots" content={seo.robots} />
	{/if}
	
	<!-- Open Graph -->
	{#if seo.openGraph}
		<meta property="og:title" content={seo.openGraph.title} />
		<meta property="og:description" content={seo.openGraph.description} />
		<meta property="og:url" content={seo.openGraph.url} />
		<meta property="og:type" content={seo.openGraph.type} />
		<meta property="og:site_name" content={siteName} />
		{#if seo.openGraph.image}
			<meta property="og:image" content={seo.openGraph.image} />
		{/if}
	{/if}
	
	<!-- Twitter Card -->
	{#if seo.openGraph}
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:title" content={seo.openGraph.title} />
		<meta name="twitter:description" content={seo.openGraph.description} />
		{#if seo.openGraph.image}
			<meta name="twitter:image" content={seo.openGraph.image} />
		{/if}
	{/if}
	
	<!-- Hreflang -->
	{#if seo.hreflang}
		{#each seo.hreflang as link}
			<link rel="alternate" hreflang={link.lang} href={link.url} />
		{/each}
	{/if}
	
	<!-- JSON-LD Structured Data -->
	{#if seo.jsonLd}
		{@html `<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>`}
	{/if}
</svelte:head>

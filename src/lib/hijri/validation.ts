import { z } from 'zod';
import type { UmmAlQuraTable, UmmAlQuraMonth, UmmAlQuraMetadata } from './types.js';

// Zod schemas for Umm al-Qura data validation
export const UmmAlQuraMonthSchema = z.object({
	h_year: z.number().int().min(1300).max(1500),
	h_month: z.number().int().min(1).max(12),
	g_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date format YYYY-MM-DD
	days: z.number().int().min(29).max(30) // Hijri months are either 29 or 30 days
});

export const UmmAlQuraMetadataSchema = z.object({
	source: z.string().min(1),
	range: z.string().min(1),
	lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date format
	description: z.string().min(1)
});

export const UmmAlQuraTableSchema = z.object({
	metadata: UmmAlQuraMetadataSchema,
	months: z.array(UmmAlQuraMonthSchema).min(1)
});

// Validation functions
export function validateUmmAlQuraTable(data: unknown): UmmAlQuraTable {
	return UmmAlQuraTableSchema.parse(data);
}

export function validateUmmAlQuraMonth(data: unknown): UmmAlQuraMonth {
	return UmmAlQuraMonthSchema.parse(data);
}

export function validateUmmAlQuraMetadata(data: unknown): UmmAlQuraMetadata {
	return UmmAlQuraMetadataSchema.parse(data);
}

// Date validation schemas for conversion functions
export const HijriDateSchema = z.object({
	year: z.number().int().min(1300).max(1500),
	month: z.number().int().min(1).max(12),
	day: z.number().int().min(1).max(30)
});

export const GregorianDateSchema = z.object({
	year: z.number().int().min(1900).max(2100),
	month: z.number().int().min(1).max(12),
	day: z.number().int().min(1).max(31)
});
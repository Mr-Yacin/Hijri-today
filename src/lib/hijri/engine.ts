// Placeholder for Hijri conversion engine
import type { HijriDate, GregorianDate, CountryProfile, ConversionEngine } from './types.js';

export class HijriEngine implements ConversionEngine {
	gregorianToHijri(date: GregorianDate, profile: CountryProfile): HijriDate {
		// TODO: Implement in task 2
		throw new Error('Not implemented yet');
	}

	hijriToGregorian(date: HijriDate, profile: CountryProfile): GregorianDate {
		// TODO: Implement in task 2
		throw new Error('Not implemented yet');
	}

	getTodayHijri(profile: CountryProfile): HijriDate {
		// TODO: Implement in task 2
		throw new Error('Not implemented yet');
	}
}
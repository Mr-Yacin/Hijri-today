/**
 * Simple toast notification utility
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000) {
	// Create toast element
	const toast = document.createElement('div');
	toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-white transition-all duration-300 transform translate-x-full`;
	
	// Set background color based on type
	const bgColors = {
		success: 'bg-green-500',
		error: 'bg-red-500',
		info: 'bg-blue-500'
	};
	
	toast.classList.add(bgColors[type]);
	toast.textContent = message;
	
	// Add to DOM
	document.body.appendChild(toast);
	
	// Animate in
	setTimeout(() => {
		toast.classList.remove('translate-x-full');
	}, 10);
	
	// Remove after duration
	setTimeout(() => {
		toast.classList.add('translate-x-full');
		setTimeout(() => {
			if (document.body.contains(toast)) {
				document.body.removeChild(toast);
			}
		}, 300);
	}, duration);
}
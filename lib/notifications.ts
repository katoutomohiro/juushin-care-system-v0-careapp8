// Minimal stub to satisfy imports from client pages without enabling PWA.
// Do not implement Notification or Service Worker logic.

export async function ensurePermission(): Promise<boolean> {
	// Notifications are disabled; always return false.
	return false
}

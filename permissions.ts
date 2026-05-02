import type { LilithPermission } from '@lilithmod/permissions'
import { getCachedInfo } from '@/licensing'
import store from '@/store'

export function permission(perm: LilithPermission): boolean {
	if (getCachedInfo().permissions[perm] != null) {
		return getCachedInfo().permissions[perm]
	}
	return false
}

export function isStreamerMode(): boolean {
	return store().streamerMode && permission('lilith.streamer')
}

import isEmpty from 'lodash.isempty'
import merge from 'lodash.merge'
import mergeWith from 'lodash.mergewith'
import set from 'lodash.set'
import type { Update } from '@/types/updatePath.js'

function customizer(objValue, srcValue) {
	if (isEmpty(srcValue)) {
		return srcValue
	}
	merge(objValue, srcValue)
}

export default function mergeObjects(defaultObject, withReplacements) {
	return mergeWith(defaultObject, withReplacements, customizer)
}

export function applyUpdates<T>(object: T, updates: Update<T>) {
	for (const update of Object.keys(updates)) {
		set(object, update, updates[update])
	}
}

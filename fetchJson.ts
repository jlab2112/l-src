import { FetchResultTypes, fetch, type RequestOptions } from '@sapphire/fetch'
import { API_URL } from '@/constants.js'

export function fetchJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
	return fetch<T>(url, options, FetchResultTypes.JSON)
}

export function fetchLilith(path: string, resultType: FetchResultTypes = FetchResultTypes.Text, options: RequestOptions = {}): Promise<any> {
	return fetch(API_URL + path, options, resultType)
}

export function fetchLilithJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
	return fetchLilith(path, FetchResultTypes.JSON, options)
}

export function post(url: string, body: any, options: RequestOptions = {}): Promise<any> {
	return fetch(
		url,
		{
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
			},
			...options,
		},
		FetchResultTypes.Result,
	)
}

export function postJson<T>(url: string, body: any, options: RequestOptions = {}): Promise<T> {
	return fetchJson<T>(url, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
		},
		...options,
	})
}

export function patchJson<T>(url: string, body: any, options: RequestOptions = {}): Promise<T> {
	return fetchJson<T>(url, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
		},
		...options,
	})
}

export function postLilithJson<T>(path: string, body: any, options: RequestOptions = {}): Promise<T> {
	return fetchLilithJson<T>(path, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
		},
		...options,
	})
}

export function patchLilithJson<T>(path: string, body: any, options: RequestOptions = {}): Promise<T> {
	return fetchLilithJson<T>(path, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
		},
		...options,
	})
}

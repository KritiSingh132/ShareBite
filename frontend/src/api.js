import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export const api = axios.create({
	baseURL,
})

export async function fetchMe() {
	const { data } = await api.get('/api/accounts/me/')
	return data
}

export function setAuthToken(token) {
	if (token) {
		api.defaults.headers.common['Authorization'] = `Bearer ${token}`
		localStorage.setItem('sb_access', token)
		// try to fetch role
		fetchMe().then((me) => {
			if (me?.role) localStorage.setItem('sb_role', me.role)
		}).catch(() => {})
	} else {
		delete api.defaults.headers.common['Authorization']
		localStorage.removeItem('sb_access')
		localStorage.removeItem('sb_role')
	}
}

// Initialize from storage on load
const existing = localStorage.getItem('sb_access')
if (existing) setAuthToken(existing)

export function getRole() {
	return localStorage.getItem('sb_role') || ''
}

export async function scanFoodImage(file) {
    const form = new FormData()
    form.append('image', file)
    const { data } = await api.post('/api/deliveries/scan/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}

export async function listNotifications() {
	const { data } = await api.get('/api/notifications/')
	return data
}

export async function markNotificationRead(id, is_read=true) {
	const { data } = await api.patch(`/api/notifications/${id}/`, { is_read })
	return data
}

export async function getDonation(id) {
	const { data } = await api.get(`/api/donations/items/${id}/`)
	return data
}




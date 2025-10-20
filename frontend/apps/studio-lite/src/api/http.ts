import axios from 'axios'

const instance = axios.create({ baseURL: '' })

instance.interceptors.request.use(cfg => {
	const t = localStorage.getItem('auth.token')
	if (t) {
		if (!cfg.headers) (cfg as any).headers = {}
		;(cfg as any).headers.Authorization = `Bearer ${t}`
	}
	return cfg
})

export const http = instance

export function setToken(token: string | null){
	if (token) localStorage.setItem('auth.token', token)
	else localStorage.removeItem('auth.token')
}
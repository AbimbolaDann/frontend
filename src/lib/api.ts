// Heliobond + project data API client.
// Reads from NEXT_PUBLIC_API_URL when set, and the request fails, so the click-through always works without a running backend.

import { HB_DATA, type Project } from '../data'
import { PROJECT_DETAILS, type ProjectDetail } from '../data/projectDetails'

class ApiError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ApiError'
		this.stack = message
	}
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface ProjectWithDetail {
	project: Project
	detail: ProjectDetail
}

export interface Investment {
	id: number
	projectId: number
	amount: number
	projectUrl: string
	// Add other fields as needed
}

export async function getProjects(): Promise<Project[]> {
	if (!API_URL) return HB_DATA.projects
	try {
		const res = await fetch(`${API_URL}/projects`)
		if (!res.ok) throw new ApiError('Unable to load projects. Please try again later.')
		return (await res.json()) as Project[]
	} catch (error) {
		if (error instanceof ApiError) throw error
		console.warn('[api] GET /projects failed -- using mock data')
		return HB_DATA.projects
	}
}

export async function getProject(id: number): Promise<ProjectWithDetail | null> {
	const mockProject = HB_DATA.projects.find((p) => p.id === id)
	const mockDetail = PROJECT_DETAILS[id]

	if (!API_URL) {
		if (!mockProject || !mockDetail) return null
		return { project: mockProject, detail: mockDetail }
	}

	try {
		const res = await fetch(`${API_URL}/projects/${id}`)
		if (!res.ok) throw new ApiError('Unable to load project. Please try again later.')
		return (await res.json()) as ProjectWithDetail
	} catch (error) {
		if (error instanceof ApiError) throw error
		console.warn(`[api] GET /projects/${id} failed -- using mock data`)
		if (!mockProject || !mockDetail) return null
		return { project: mockProject, detail: mockDetail }
	}
}

export async function createInvestment(input: { projectId: number; amount: number }): Promise<Investment> {
	const mockInvestment = (): Investment =>
		({
			id: Math.floor(Math.random() * 100000) + 1,
			projectId: input.projectId,
			amount: input.amount,
			projectUrl: `/projects/${input.projectId}`,
		})

	if (!API_URL) {
		return mockInvestment()
	}

	try {
		const res = await fetch(`${API_URL}/investments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})
		if (!res.ok) throw new ApiError('Investment failed. Please try again later.')
		const data = (await res.json()) as Investment
		return {
			...data,
			projectUrl: `/projects/${input.projectId}`,
		}
	} catch (error) {
		if (error instanceof ApiError) throw error
		console.warn('[api] POST /investments failed -- using mock data')
		return mockInvestment()
	}
}

/**
 * Performs biometric login (Face ID / Touch ID) using the WebAuthn API.
 * Returns true if the user successfully authenticates, false otherwise.
 * This is a client-side implementation; the actual verification should happen
 * with a backend challenge, but for now we generate a random challenge locally.
 */
export async function biometricLogin(): Promise<boolean> {
	if (typeof window === 'undefined' || !window.PublicKeyCredential) {
		console.warn('[api] Biometric login not supported on this device/browser')
		return false
	}

	try {
		const challenge = new Uint8Array(32)
		crypto.getRandomValues(challenge)

		// Request a credential from the authenticator
		const credential = await navigator.credentials.get({
			publicKey: {
				challenge,
				rpId: window.location.hostname,
				allowCredentials: [],
				userVerification: 'required',
			},
		})

		return Boolean(credential)
	} catch (error) {
		console.warn('[api] biometric login failed:', error)
		return false
	}
}

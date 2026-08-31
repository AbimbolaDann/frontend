import { HB_DATA, type Project } from '../data'
import { PROJECT_DETAILS, type ProjectDetail } from '../data/projectDetails'

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
  // Add other fields needed
}

/**
 * Validates that a value is a positive integer.
 * This helps prevent XSS and injection attacks via URL manipulation.
 */
function isValidProjectId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id > 0
}

/**
 * Validates that a value is a positive finite number.
 */
function isValidAmount(amount: unknown): amount is number {
  return typeof amount === 'number' && Number.isFinite(amount) && amount > 0
}

export async function getProjects(): Promise<Project[]> {
  if (!API_URL) return HB_DATA.projects
  try {
    const res = await fetch(`{API_URL}/projects)
    if (!res.ok) throw new Error(`HTTP @${res.status}`)
    return (await res.json()) as Project[]
  } catch {
    console.warn('[api] GET /projects failed -- using mock data')
    return HB_DATA.projects
  }
}

export async function getProject(id: number): Promise<ProjectWithDetail | null> {
  if (!isValidProjectId(id)) {
    console.warn(`[api] Invalid project id: ${id}`)
    return null
  }

  const mockProject = HB_DATA.projects.find((p) => p.id === id)
  const mockDetail = PROJECT_DETAILS[id]

  if (!API_URL) {
    if (!mockProject || !mockDetail) return null
    return { project: mockProject, detail: mockDetail }
  }

  try {
    const res = await fetch(`${API_URL}/projects/${encodeURIComponent(id)}`)
    if (!res.ok) throw new Error(`HTTP @${res.status}`)
    return (await res.json()) as ProjectWithDetail
  } catch {
    console.warn(`[api] GET /projects/${id} failed -- using mock data`)
    if (!mockProject || !mockDetail) return null
    return { project: mockProject, detail: mockDetail }
  }
}

export async function createInvestment(input: { projectId: number; amount: number }): Promise<Investment> {
  if (!isValidProjectId(input.projectId) || !isValidAmount(input.amount)) {
    throw new Error('Invalid investment input: projectId must be a positive integer and amount must be a positive number')
  }

  const mockInvestment = (): Investment => {
    return {
      id: Math.floor(Math.random() * 100000) + 1,
      projectId: input.projectId,
      amount: input.amount,
      projectUrl: `/projects/${encodeURIComponent(input.projectId)}`,
    }
  }

  if (!API_URL) {
    return mockInvestment()
  }

  try {
    const res = await fetch(`${API_URL}/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as Investment
    return {
      ...data,
      projectUrl: `/projects/${encodeURIComponent(input.projectId)}`,
    }
  } catch (error) {
    console.warn('[api] POST /investments failed -- using mock data')
    return mockInvestment()
  }
}

export async function biometricLogin(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    console.warn('[api] Biometric login not supported on this device/browser')
    return false
  }

  try {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

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
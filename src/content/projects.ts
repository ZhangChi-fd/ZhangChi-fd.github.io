export interface Project {
  id: string
  title: string
  category: 'Research direction' | 'Research project'
  summary: string
  motivation?: string
  methods?: string
  figures?: { src: string; alt: string; caption?: string }[]
  publicationIds?: string[]
  links?: { label: string; url: string }[]
}

export const projects: Project[] = [
  { id: 'angle-tracking', title: 'Angle-Based Target Tracking and Control', category: 'Research direction', summary: 'Tracking a target and controlling motion using angular measurements.' },
  { id: 'sensor-placement', title: 'Information-Theoretic Sensor Placement', category: 'Research direction', summary: 'Choosing sensor locations using information-theoretic criteria.' },
  { id: 'relative-localization', title: 'Multi-Robot Relative Localization and Formation Control', category: 'Research direction', summary: 'Estimating the relative positions of robots and controlling their formation.' },
  { id: 'formal-verification', title: 'Formal Verification and AI Agents for Control Theory', category: 'Research direction', summary: 'Exploring how formal verification and AI agents can support work in control theory.' },
]

export const publications: Record<string, { title: string; status?: string; url?: string }> = {}

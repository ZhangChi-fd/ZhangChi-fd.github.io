import { githubProfile } from './websites'
import about from './about.json'

export const profile = { name: 'Chi Zhang', initials: 'CZ' }

export interface DocumentPhoto { src: string; alt: string }
export interface AboutContent {
  title: string
  portrait?: DocumentPhoto
  sections: { heading?: string; text: string; photo?: DocumentPhoto }[]
}
export interface DocumentContent extends AboutContent {
  appearance: 'word' | 'notepad'
  shortcuts?: string[]
  links?: { label: string; url: string }[]
}

const aboutDocument: DocumentContent = { ...about, appearance: 'word', shortcuts: ['projects', 'contact'] }
export const documents = {
  profile: aboutDocument,
  contact: {
    appearance: 'notepad', title: 'Contact', sections: [],
    links: [{ label: 'GitHub · ZhangChi-fd', url: githubProfile }],
  },
} satisfies Record<string, DocumentContent>

if (import.meta.hot) {
  import.meta.hot.accept('./about.json', updated => {
    if (!updated) return
    // Keep other open editor tabs intact so their revision can be checked on save.
    documents.profile = { ...aboutDocument, ...updated.default, portrait: updated.default.portrait }
    window.dispatchEvent(new Event('about-updated'))
  })
}

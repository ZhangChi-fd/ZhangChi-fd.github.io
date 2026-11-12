import { useEffect, useState } from 'react'
import { documents, type AboutContent, type DocumentPhoto } from '../content/documents'
import type { DesktopEntry } from '../registry'
import DocumentViewer from './Document'
import './local-about.css'

interface Draft { revision: string; content: AboutContent }

async function photoFromFile(file: File) {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 1440 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')!
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.88)
  } finally { bitmap.close() }
}

function PhotoField({ label, photo, change, load }: {
  label: string; photo?: DocumentPhoto; change: (photo?: DocumentPhoto) => void
  load: (file: File, accept: (src: string) => void) => void
}) {
  return <div className="about-photo-field">
    <label>{label}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
      const file = event.currentTarget.files?.[0]
      event.currentTarget.value = ''
      if (file) load(file, src => change({ src, alt: photo?.alt ?? '' }))
    }} /></label>
    {photo && <>
      <img alt={photo.alt || label} src={photo.src} />
      <label>图片描述<input value={photo.alt} onChange={e => change({ ...photo, alt: e.target.value })} /></label>
      <button type="button" onClick={() => change(undefined)}>移除照片</button>
    </>}
  </div>
}

export default function LocalAbout({ onOpen }: { onOpen: (entry: DesktopEntry) => void }) {
  const [saved, setSaved] = useState<AboutContent>(documents.profile)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    const update = () => setSaved(documents.profile)
    window.addEventListener('about-updated', update)
    return () => window.removeEventListener('about-updated', update)
  }, [])

  async function edit() {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/__local/about')
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json'))
        throw new Error('请重新启动本地开发预览后重试。')
      setDraft(await response.json())
      setPreview(false)
    } catch (error) { setMessage(error instanceof Error ? error.message : '无法打开编辑器。') }
    finally { setBusy(false) }
  }
  async function load(file: File, accept: (src: string) => void) {
    setBusy(true)
    setMessage('')
    try { accept(await photoFromFile(file)) }
    catch { setMessage('无法读取照片，请选择 JPG、PNG 或 WebP 图片。') }
    finally { setBusy(false) }
  }
  async function save() {
    if (!draft) return
    if (!draft.content.title.trim()) { setMessage('请填写文档标题。'); return }
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/__local/about', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setSaved(result.content)
      setDraft(null)
      setPreview(false)
      setMessage('已保存到项目')
    } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败，请重试。') }
    finally { setBusy(false) }
  }
  function change(patch: Partial<AboutContent>) {
    setDraft(previous => previous && { ...previous, content: { ...previous.content, ...patch } })
  }
  function changeSection(index: number, patch: Partial<AboutContent['sections'][number]>) {
    if (draft) change({ sections: draft.content.sections.map((s, i) => i === index ? { ...s, ...patch } : s) })
  }

  if (!draft || preview) {
    const visible = draft?.content ?? saved
    const content = { ...documents.profile, ...visible, portrait: visible.portrait }
    return <DocumentViewer content={content} onOpen={onOpen} actions={<div className="about-actions" lang="zh-CN">
      {message && <span role="status">{message}</span>}
      {draft ? <><button disabled={busy} onClick={() => setPreview(false)}>继续编辑</button>
        <button disabled={busy} onClick={save}>保存到项目</button></> :
        <button disabled={busy} onClick={edit}>编辑简介</button>}
    </div>} />
  }
  return <form className="about-editor" lang="zh-CN" onSubmit={e => { e.preventDefault(); void save() }}>
    <div className="about-command">
      <strong>编辑简介</strong>
      <button type="button" disabled={busy} onClick={() => setPreview(true)}>预览</button>
      <button type="submit" disabled={busy}>保存到项目</button>
      <button type="button" disabled={busy} onClick={() => { setDraft(null); setMessage('') }}>取消</button>
    </div>
    {message && <p className="about-message" role="status">{message}</p>}
    <fieldset disabled={busy} className="about-fields">
      <label>文档标题<input required value={draft.content.title} onChange={e => change({ title: e.target.value })} /></label>
      <PhotoField label="个人照片（页首）" photo={draft.content.portrait} load={load} change={portrait => change({ portrait })} />
      {draft.content.sections.map((section, i) => <fieldset className="about-section" key={i}>
        <legend>第 {i + 1} 段</legend>
        <label>小标题（可选）<input value={section.heading ?? ''} onChange={e => changeSection(i, { heading: e.target.value })} /></label>
        <label>正文<textarea aria-label="正文" rows={4} value={section.text} onChange={e => changeSection(i, { text: e.target.value })} /></label>
        <PhotoField label="段落照片" photo={section.photo} load={load} change={photo => changeSection(i, { photo })} />
        <button type="button" onClick={() => change({ sections: draft.content.sections.filter((_, n) => n !== i) })}>删除此段</button>
      </fieldset>)}
      <button type="button" onClick={() => change({ sections: [...draft.content.sections, { text: '' }] })}>添加段落</button>
    </fieldset>
  </form>
}

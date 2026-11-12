import { useState, type ReactNode } from 'react'
import type { DocumentContent, DocumentPhoto } from '../content/documents'
import { entries, reviewAssets, type DesktopEntry } from '../registry'
import { Glyph, Menubar } from './chrome'

const commands = ['page_white', 'folder_page', 'disk', 'printer', 'page_white_magnify', 'spellcheck',
  'cut', 'page_copy', 'paste_plain', 'paintbrush', 'arrow_undo', 'arrow_redo', 'world_link', 'table', 'chart_bar']
const paragraphCommands = ['text_align_left', 'text_align_center', 'text_align_right', 'text_list_numbers', 'text_list_bullets']

function PaperPhoto({ photo, portrait = false }: { photo: DocumentPhoto; portrait?: boolean }) {
  return <figure className={portrait ? 'portrait' : 'paragraph-photo'}>
    <img src={photo.src} alt={photo.alt} />
    {photo.alt.trim() && <figcaption>{photo.alt}</figcaption>}
  </figure>
}

export default function DocumentViewer({ content, onOpen, actions }: { content: DocumentContent; onOpen: (entry: DesktopEntry) => void; actions?: ReactNode }) {
  const [zoom, setZoom] = useState(100)
  const word = content.appearance === 'word'
  const shortcuts = entries.filter(entry => content.shortcuts?.includes(entry.id))
  const page = <article className={word ? 'word-paper' : 'notepad-paper'} style={{ fontSize: `${zoom}%` }}>
    {content.portrait && <PaperPhoto photo={content.portrait} portrait />}
    <h1>{content.title}</h1>
    {content.sections.map((section, index) => <div key={index}>
      {section.heading && <h2>{section.heading}</h2>}<p>{section.text}</p>
      {section.photo && <PaperPhoto photo={section.photo} />}
    </div>)}
    {content.links?.map(link => <p key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a></p>)}
    {shortcuts.length > 0 && <nav className="document-links" aria-label="Related portfolio sections">
      {shortcuts.map(entry => <button key={entry.id} onClick={() => onOpen(entry)}>{entry.label}</button>)}
    </nav>}
  </article>

  if (!word) return <div className="app-view notepad">
    <Menubar labels={['File', 'Edit', 'Format', 'View', 'Help']} />{page}
  </div>
  return <div className="app-view word">
    <div className="word-menu-row"><Menubar labels={['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Table', 'Window', 'Help']} />{actions}</div>
    <div className="office-bar standard-bar">
      <div className="standard-icons" aria-hidden="true">
        {reviewAssets ? <img className="word-original" src={`${reviewAssets}/word-standard.png`} alt="" /> :
          commands.map(name => <Glyph key={name} name={name} />)}
      </div>
      <Glyph name="magnifier" /><select aria-label="Document zoom" value={zoom} onChange={event => setZoom(Number(event.target.value))}>
        {[85, 100, 115, 125, 150].map(value => <option key={value} value={value}>{value}%</option>)}
      </select>
    </div>
    <div className="office-bar format-bar" aria-hidden="true">
      <span className="combo style-name">Normal</span><span className="combo font-name">Times New Roman</span><span className="combo font-size">12</span>
      <b>B</b><i>I</i><u>U</u><span className="tool-divider" />
      {paragraphCommands.map(name => <Glyph key={name} name={name} />)}
    </div>
    <div className="word-ruler" aria-hidden="true"><div className="ruler-scale">
      {[1, 2, 3, 4, 5, 6].map(value => <span key={value}>{value}</span>)}
    </div></div>
    <div className="word-workspace"><div className="vertical-ruler" aria-hidden="true" />{page}</div>
    <div className="word-status"><span>Page 1</span><span>Sec 1</span><span>1/1</span><span>Read-only</span></div>
  </div>
}

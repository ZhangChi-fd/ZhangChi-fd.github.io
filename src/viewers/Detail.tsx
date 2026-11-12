import { publications, type Project } from '../content/projects'
import type { Photo } from '../content/photos'

export function ProjectDetail({ project }: { project: Project }) {
  return <article className="project-detail">
    <small>{project.category}</small><h2>{project.title}</h2><p>{project.summary}</p>
    {project.motivation && <><h3>Research problem</h3><p>{project.motivation}</p></>}
    {project.methods && <><h3>Methods</h3><p>{project.methods}</p></>}
    {project.figures?.map(figure => <figure key={figure.src}><img src={figure.src} alt={figure.alt} loading="lazy" />
      {figure.caption && <figcaption>{figure.caption}</figcaption>}</figure>)}
    {project.publicationIds?.map(id => {
      const publication = publications[id]
      if (!publication) return null
      return <p key={id}>{publication.url ? <a href={publication.url} target="_blank" rel="noopener noreferrer">{publication.title}</a> : publication.title}
        {publication.status && ` (${publication.status})`}</p>
    })}
    {project.links?.map(link => <p key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a></p>)}
  </article>
}

export function PhotoViewer({ photo, collection, onChoose }: { photo: Photo; collection: Photo[]; onChoose: (id: string) => void }) {
  const index = collection.findIndex(item => item.id === photo.id)
  return <div className="picture-preview">
    <figure><img src={photo.src} alt={photo.alt} /><figcaption>{photo.caption ?? photo.title}</figcaption></figure>
    <div className="picture-controls">
      <button disabled={index === 0} onClick={() => onChoose(collection[index - 1].id)}>Previous</button>
      <span>{index + 1} / {collection.length}</span>
      <button disabled={index === collection.length - 1} onClick={() => onChoose(collection[index + 1].id)}>Next</button>
    </div>
  </div>
}

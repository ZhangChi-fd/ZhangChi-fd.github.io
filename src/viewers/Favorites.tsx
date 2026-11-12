import { websites } from '../content/websites'
import { iconUrl } from '../registry'

export default function Favorites() {
  return <div className="app-view favorites">
    <header className="favorites-heading"><img src={iconUrl('browser')} alt="" /><h1>Favorites</h1></header>
    <ul>{websites.map(site => <li key={site.url}>
      <img src="/media/toolbar/world_link.png" alt="" />
      <div><a href={site.url} target="_blank" rel="noopener noreferrer">{site.title}</a>
        {site.description && <p>{site.description}</p>}<small>{site.url}</small></div>
    </li>)}</ul>
  </div>
}

export function Menubar({ labels }: { labels: string[] }) {
  return <div className="classic-menus" aria-hidden="true">
    {labels.map(label => <span key={label}><u>{label[0]}</u>{label.slice(1)}</span>)}
  </div>
}

export function Glyph({ name }: { name: string }) {
  return <img className="glyph" src={`/media/toolbar/${name}.png`} alt="" draggable={false} />
}

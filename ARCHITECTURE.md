# Architecture

Use React and TypeScript with Vite’s static build. React owns the desktop and its windows in one page. A small reducer owns window transitions. Typed content modules supply the portfolio. The only proposed runtime packages are React and React DOM.

## Files

```text
index.html                        Vite entry, starting in milestone 1
src/
  main.tsx                        mount the desktop
  Desktop.tsx                     desktop icons, Start menu, taskbar, activation
  WindowShell.tsx                 title bar, window controls, pointer dragging
  windowManager.ts                ordered windows, geometry, reducer
  registry.ts                     desktop entries, typed viewer targets
  content/
    documents.ts                  profile and contacts
    projects.ts                   research directions, projects, cited publications
    photos.ts                     root photos and named albums
    collections.ts                collections and typed folder items
    websites.ts                   Internet bookmarks
  viewers/
    index.tsx                     typed target-to-viewer dispatch
    Document.tsx                  formatted page or plain-text presentation
    Folder.tsx                    labeled icon or thumbnail grid
    Detail.tsx                    project and photo detail viewers
    Favorites.tsx                 saved website links
  desktop.css                     shared theme and responsive layout
public/
  media/                          original artwork, thumbnails and full images
  documents/                      supplied CV
.github/workflows/pages.yml       single Pages workflow in milestone 6
```

The foundation also needs a package manifest, lockfile, TypeScript and Vite settings, and ignore rules for dependencies and build output. Keep small navigation controls together in Desktop until their complexity warrants separate files.

## From content to a window

1. A desktop entry declares a stable ID, label, icon, order, Start visibility, optional initial-open flag, and a typed target. Both navigation surfaces consume the same sorted registry. The About entry’s initial-open flag uses the same activation path as a visitor click.
2. Each target pairs its kind with a content reference. Document targets resolve a structured title and sections, optional media and links, and a page or plain-text appearance. Folder targets resolve a collection. Project and photo targets resolve their respective records. A PDF target resolves to an asset URL or a labeled unavailable state.
3. A folder accepts project, photo, document, external link, and internal shortcut items. Each item references the authoritative record or entry. A Projects or Photos folder can derive its items from its collection in display order. Adding a record then automatically adds the corresponding icon. New curated folders can supply an ordered list of references.
4. The activation handler routes a verified link or PDF to a native anchor. It sends window targets to the manager with a stable key and display metadata. A small exhaustive TypeScript dispatch in the viewer module selects the component and resolves its typed props. Viewer content can request navigation through the same handler.

Store each project’s title, summary, motivation, methods or contributions, figure references, related publication IDs, and links together. Render optional fields only when supplied. Give each publication one metadata record and link it by ID from every relevant project. A photo record has an ID, thumbnail, full image, alt text, and optional caption. Load thumbnails lazily and request a full-size image when opened. Each photo viewer receives its collection order for previous/next navigation.

## Window state and focus

Keep window instances in opening order for a stable taskbar and keyboard sequence. Each instance carries a stable key, a stacking level, a minimized flag, and a desktop position. The highest visible stacking level determines the active key. Desktop resolves the key to display metadata and content. Selecting an icon is independent of activating a window.

| Action | State and focus |
| --- | --- |
| Open | Create a window once per target, or reveal the existing one and move it to the front. Start About next to the icon column. Cascade subsequent windows within the usable area. |
| Focus or restore | Promote the window on pointer or keyboard focus within it. Taskbar activation reveals it, raises it, and returns keyboard focus inside. Preserve a clicked link or button’s own focus. |
| Minimize or close | Hide or remove the instance. Focus the next visible window. When none remains, return focus to the launching control if available, otherwise Start. |
| Drag | The shell captures a primary pointer on the title bar, excluding control buttons. Clamp the final position to the space above the taskbar. Constrain oversized windows to that space and scroll the body. Re-clamp on resize. |
| Open detail and return | Project details and photo previews use the containing Explorer window. History records the album and file IDs. Previous/next uses the current album. |

Use the same instances at narrow widths. Present only the active window, size it to the available viewport, suppress dragging, and keep inactive windows out of the tab order. Show the desktop when all are minimized or closed. Start is a disclosure containing ordinary navigation controls. Escape closes it and returns focus to Start. Use a labeled, non-modal region for each desktop window so keyboard users can reach the taskbar. Desktop windows retain their position and size while maximized. The middle title-bar control or a title-bar double-click toggles maximize. Four edges and four corner handles resize the normal rectangle within the desktop. Phone panes use the full workspace above the taskbar.

## Extension points

| Addition | Expected edits | Verification |
| --- | --- | --- |
| A project or a batch of photos | Add records and any media files. | Inspect the existing grid, detail views, image order, and long titles. |
| A Publications or Notes folder | Define the collection, reuse document or link items, and add one desktop entry targeting the folder viewer. | The new section appears in the configured order in both navigation surfaces. |
| An interactive research visualization | Add a target kind, its typed content, and one viewer in the dispatch module. | Open, focus, minimize, and restore it using the existing shell. |

## Styling and hosting decisions

XP.css offers CSS-only window chrome and controls under MIT. The distinctive work here is the desktop layout, icon rail, document typography, and mobile pane. Use a small local stylesheet for these and the few shared controls. This keeps touch sizing and reading contrast under project control. Use original icons and wallpaper, and document any licensed additions in the content guide. [XP.css](https://github.com/botoxparty/XP.css)

Use Vite’s root base `/`, root-safe asset paths, and a single HTML entry. Local navigation needs no server routes or SPA rewrite. Serve the contents of `dist/` as the Pages artifact. Reusing the root layout also permits a later custom hostname without edits to portfolio components. [Vite’s GitHub Pages guidance](https://vite.dev/guide/static-deploy.html#github-pages)

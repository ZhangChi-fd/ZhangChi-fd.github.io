# ZhangChi-fd.github.io
Chi Zhang’s academic portfolio. About Me opens on arrival. Select a desktop icon with a click and open it with a double-click, Enter, Space, or a single touch tap. Start shortcuts open with one click. Drag a window by its title bar. Use its title-bar buttons to minimize or close it, and its taskbar entry to restore or focus it. Narrow screens show the foreground window and keep Start and the taskbar available.

## Local development

Double-click the taskbar clock to browse the calendar or choose a country and time zone. The speaker and Windows Media Player share playback controls. Bach’s Air loops in the minimized player on arrival until the visitor changes tracks. Select Bad Romance to play the local MP4. The content guide includes track credits and instructions for adding music and setting a default time zone.

Find editable biography, contact links, project figures, albums, CV, and website bookmarks in the [Chinese content guide](CONTENT_GUIDE.md). Every desktop window supports dragging its edges or corners to resize, and maximizing to the area above the taskbar. Double-click the title bar or click the middle title-bar control to maximize or restore.

Use Node 24 and npm 11. Run `npm ci` and `npm run dev`, then open the local URL printed by Vite. Run `npm run build` for a TypeScript check and static output in `dist/`. Run `npm run preview` to inspect that output. The site uses Vite’s default root base for the existing GitHub Pages user site.

## Artwork

The production build uses the project’s own SVG drawings in `public/media/`, system fonts, and the AI-generated landscape `meadow.webp`. The local design review uses the supplied Bliss reference, the chess avatar from the supplied screenshot, and raster icons from the community theme listed below. This review set has no verified public-web redistribution grant. It is stored in the ignored `.local-preview/` directory, outside the production asset tree.

| Local review asset | Source in the pinned theme |
| --- | --- |
| About Me.doc and CV.pdf | `48x48/mimetypes/x-office-document.png` and `application-pdf.png` |
| Projects and Photos | `128x128/places/gtk-directory.png` and `folder-images.png` |
| Contact.txt and Start | `128x128/apps/abiword.png` and `start-here.png` |

This checkout enables the review set through `VITE_XP_PREVIEW_ASSETS=/.local-preview` in the ignored `.env.development.local`. Fresh checkouts use the project artwork automatically. The reviewed archive’s scalable folder, picture-folder and Start files contain embedded PNG data. Use the raster source when comparing the classic artwork at desktop-icon size. [Pinned community icon theme](https://github.com/B00merang-Artwork/Windows-XP/tree/24e95ad2b12c55dd11883ee7066525527d944039) · [Bliss photograph](https://ucrarts.ucr.edu/education/bliss/) · [Microsoft asset usage guidance](https://www.microsoft.com/en-us/legal/intellectualproperty/copyright/permissions)

The Word reader uses a print-layout workspace with a working zoom control. Its period editing commands are visual references in this read-only view. The local review uses a cropped Word 2003 Standard toolbar from the World Class CAD teaching manual and XP-style Back, Forward, and Up graphics from the winXP reference implementation. [Word 2003 reference, p. 4](https://www.worldclasscad.com/word_pdf/2003%20book/2003%20ch01%20introduction%20to%20word%20processing.pdf) · [Explorer review graphics](https://github.com/ShizukuIchi/winXP/tree/856bb554b3667f62078010b4cee10cc2645761e1/src/assets/windowsIcons)

The distributed toolbars use Mark James’s Silk icons under CC BY 2.5. Attribution is also included with the deployed image files. [Silk icons](http://www.famfamfam.com/lab/icons/silk/) · [License and original credit](https://github.com/legacy-icons/famfamfam-silk/blob/d6056f5c28e46c28403888ab7c013aced3928ec8/LICENSE.md)

The Internet shortcut uses an original globe in production. Its local review icon comes from the same pinned winXP graphics collection as the Explorer arrows.

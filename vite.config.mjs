import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'

const endpoint = '/__local/about'
const loopback = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const digest = bytes => createHash('sha256').update(bytes).digest('hex')

function fail(status, message) {
  throw Object.assign(new Error(message), { status })
}

function cleanPhoto(photo, images) {
  if (!photo) return undefined
  if (typeof photo.src !== 'string' || typeof photo.alt !== 'string') fail(400, '照片数据不完整。')
  if (photo.src.startsWith('/media/') && !photo.src.includes('..') && !photo.src.includes('\\')) {
    return { src: photo.src, alt: photo.alt }
  }
  if (!/^data:image\/jpeg;base64,[a-zA-Z0-9+/]+=*$/.test(photo.src)) fail(400, '请选择有效的照片。')
  const bytes = Buffer.from(photo.src.slice(photo.src.indexOf(',') + 1), 'base64')
  if (bytes.length < 4 || bytes.readUInt16BE(0) !== 0xffd8 || bytes.readUInt16BE(bytes.length - 2) !== 0xffd9)
    fail(400, '无法读取 JPEG 照片。')
  const filename = digest(bytes) + '.jpg'
  images.set(filename, bytes)
  return { src: '/media/about/' + filename, alt: photo.alt }
}

function aboutEditor() {
  return {
    name: 'local-about-editor',
    apply: 'serve',
    configureServer(server) {
      const file = path.join(server.config.root, 'src/content/about.json')
      const media = path.join(server.config.publicDir, 'media/about')
      server.middlewares.use(async (req, res, next) => {
        // A freshly saved portrait can be requested before Vite indexes the new public file.
        const photo = /^\/media\/about\/([a-f0-9]{64}\.jpg)$/.exec(req.url?.split('?')[0] ?? '')
        if (photo && (req.method === 'GET' || req.method === 'HEAD')) {
          try {
            const bytes = await readFile(path.join(media, photo[1]))
            res.setHeader('Content-Type', 'image/jpeg')
            res.setHeader('Content-Length', bytes.length)
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
            return res.end(req.method === 'HEAD' ? undefined : bytes)
          } catch (error) {
            if (error.code !== 'ENOENT') return next(error)
            res.statusCode = 404
            return res.end()
          }
        }
        if (req.url !== endpoint) return next()
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        try {
          const host = req.headers.host
          if (!loopback.has(req.socket.remoteAddress) || !/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host ?? ''))
            fail(403, '请在本机预览中编辑。')
          if (req.method === 'GET') {
            const raw = readFileSync(file)
            return res.end(JSON.stringify({ revision: digest(raw), content: JSON.parse(raw) }))
          }
          if (req.method !== 'POST') fail(405, '不支持该请求。')
          if (req.headers.origin !== 'http://' + host && req.headers.origin !== 'https://' + host)
            fail(403, '请从当前本地页面保存。')
          if (req.headers['content-type'] !== 'application/json') fail(415, '内容格式不正确。')
          const chunks = []
          let total = 0
          for await (const chunk of req) {
            total += chunk.length
            if (total > 24 * 1024 * 1024) fail(413, '本次照片较多，请分次保存。')
            chunks.push(chunk)
          }
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          const images = new Map()
          const source = body.content
          if (!source || typeof source.title !== 'string' || !source.title.trim() || !Array.isArray(source.sections))
            fail(400, '请填写文档标题和正文。')
          const content = {
            title: source.title,
            portrait: cleanPhoto(source.portrait, images),
            sections: source.sections.map(section => {
              if (typeof section?.text !== 'string' || (section.heading != null && typeof section.heading !== 'string'))
                fail(400, '段落格式不正确。')
              return { heading: section.heading || undefined, text: section.text, photo: cleanPhoto(section.photo, images) }
            }),
          }
          // Keep the revision check and replacement together. Publish referenced files first.
          if (digest(readFileSync(file)) !== body.revision) fail(409, '简介已在别处更新。请复制需要保留的文字，再取消并重新打开编辑器。')
          if (images.size) mkdirSync(media, { recursive: true })
          for (const [filename, bytes] of images) {
            const target = path.join(media, filename)
            if (!existsSync(target)) writeFileSync(target, bytes)
          }
          const raw = JSON.stringify(content, null, 2) + '\n'
          const temp = file + '.' + randomUUID() + '.tmp'
          writeFileSync(temp, raw)
          renameSync(temp, file)
          res.end(JSON.stringify({ revision: digest(raw), content }))
        } catch (error) {
          res.statusCode = error.status ?? (error instanceof SyntaxError ? 400 : 500)
          res.end(JSON.stringify({ error: error.status ? error.message : '保存或读取失败，请检查项目文件后重试。' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [aboutEditor()],
})

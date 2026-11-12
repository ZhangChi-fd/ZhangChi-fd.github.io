# 网站内容维护指南

网站正文默认使用英文。下面的文件路径以仓库根目录为起点。示例中的标题、网址和图片名需要换成你的真实内容。

| 想改什么 | 编辑位置 |
| --- | --- |
| 简介、研究兴趣、个人照片 | 本地 About Me.doc → 编辑简介，或 `src/content/about.json` |
| 联系方式 | `src/content/documents.ts` |
| 项目、项目图片、关联论文 | `src/content/projects.ts` |
| 照片、相册子文件夹 | `src/content/photos.ts` |
| Internet 窗口中的网址 | `src/content/websites.ts` |
| 桌面图标、开始菜单、CV 地址 | `src/registry.ts` |
| 开始菜单的用户名、头像缩写 | `src/content/documents.ts` 的 `profile` |
| 公开歌单、录音、MV、曲目顺序 | `src/content/music.ts` 的 `playlist`，媒体文件放在 `public/media/music/` |
| 首次访问时显示的时区 | `src/content/clock.ts` 的 `defaultTimeZone` |

图片、缩略图和 PDF 放在 `public/` 下。比如磁盘文件是 `public/media/projects/tracking/setup.webp`，代码里写 `/media/projects/tracking/setup.webp`。文件名建议使用小写英文和连字符，并保持大小写一致。

## 更新 About Me 和 Contact

1. 用 `npm run dev` 启动本机开发预览。在 About Me.doc 菜单栏右侧点 **编辑简介**。
2. 修改标题和各段正文，按需添加段落。**个人照片（页首）** 显示在第一页右上方；**段落照片** 显示在对应段落下方。可以选 JPG、PNG 或 WebP，也可以替换或移除已选照片。
3. **图片描述** 会作为图注显示在对应照片下方，留空即可只显示照片。点 **预览** 查看文字、图注和图片的排版。点 **继续编辑** 调整，或点 **保存到项目** 写入文件。点 **取消** 放弃当前未保存的修改。
4. 保存后刷新页面即可再次查看。标题和段落保存在 `src/content/about.json`，选择的图片会等比缩小并写入 `public/media/about/`。移除照片会从文档中移除引用，之前生成的图片文件可在发布前按需整理。本地编辑不会自动更新 GitHub。公开版只显示已保存的简介。

在 `documents.contact.links` 数组中保留已有 GitHub 项，按需追加下面的对象。LinkedIn 使用个人公开主页的完整网址，电子邮箱使用 `mailto:`。纯文字说明可放入 `contact.sections`，例如 `{ text: '你的实际办公地点' }`。

```ts
{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/YOUR-PROFILE/' },
{ label: 'Email', url: 'mailto:YOUR-ADDRESS@example.org' },
```

## 增加一个带图的研究项目

打开 `src/content/projects.ts`，在 `projects` 数组里添加对象。数组顺序就是文件夹里的显示顺序。现有四项标为 `Research direction`。有实际项目内容后，也可以直接充实已有记录，将其类别改为 `Research project` 并保留原来的 `id`。

```ts
{
  id: 'my-project',
  title: 'Your project title',
  category: 'Research project',
  summary: '用一两句英文说明项目研究什么。',
  motivation: '说明研究问题和动机。',
  methods: '写入已经确认的方法或贡献。',
  figures: [
    {
      src: '/media/projects/my-project/setup.webp',
      alt: '描述图中装置或图表表达的信息',
      caption: '可选图注',
    },
  ],
  links: [{ label: 'Project repository', url: 'https://github.com/YOUR-NAME/YOUR-REPO' }],
},
```

把示例图片放在 `public/media/projects/my-project/setup.webp`。多张图继续追加到 `figures`。没有真实内容的可选字段可以直接省略。关联论文时，先在同文件的 `publications` 对象内添加一条记录，例如 `'paper-id': { title: '真实论文标题', url: '完整网址' }`，再在项目中写 `publicationIds: ['paper-id']`。论文状态确认后才填写可选的 `status`。

## 在 Photos 中建立相册并放入照片

每个相册对应 Photos 里的一个子文件夹。先为照片准备展示图和较小的缩略图，例如将四个文件放在 `public/media/photos/campus/` 下。然后在 `src/content/photos.ts` 的 `albums` 数组中添加一个相册对象。

```ts
{
  id: 'campus',
  title: 'Campus',
  photos: [
    {
      id: 'garden', title: 'Garden',
      thumbnail: '/media/photos/campus/garden-thumb.webp',
      src: '/media/photos/campus/garden.webp',
      alt: '根据照片内容填写英文替代文字',
      caption: '可选的日期、地点或说明',
    },
    {
      id: 'library', title: 'Library',
      thumbnail: '/media/photos/campus/library-thumb.webp',
      src: '/media/photos/campus/library.webp',
      alt: '根据第二张照片的内容填写',
    },
  ],
},
```

再建一个相册，就在 `albums` 中继续添加对象。想把照片直接放在 Photos 根目录，则把照片对象放进文件顶部单独的 `photos` 数组。每个文件夹内使用唯一、稳定的 `id`。上一张和下一张按当前相册的数组顺序浏览，点“上一级”回到照片所在的文件夹。浏览文件夹只加载缩略图，打开照片后才请求大图。

## 给 Internet 收藏夹增加网址

在 `src/content/websites.ts` 的 `websites` 中每行放一个网站。数组顺序就是显示顺序。桌面双击 Internet 后，单击某个名称会在浏览器的新标签页打开完整网址，也支持直接打开某篇文章或仓库子页。

```ts
{ title: 'Your website', url: 'https://example.org/your-page', description: '可选的一句说明' },
```

## 替换 CV

把真实 PDF 保存为 `public/documents/cv.pdf`。在 `src/registry.ts` 找到 `id: 'cv'`，将其目标改为 `target: { kind: 'pdf', url: '/documents/cv.pdf' }`，并把 `description` 改为 `Academic CV`。以后以同名文件替换即可。

## 添加桌面栏目或查看器

复用文件夹时，先在 `src/content/collections.ts` 的 `folders` 里定义栏目，再在 `src/registry.ts` 的 `entries` 里注册一项。以下示例可复制到各自的位置。

```ts
// folders 对象的一个属性
notes: {
  group: 'Notes', empty: 'No notes have been added yet.', defaultView: 'Icons',
  items: [{ kind: 'shortcut', id: 'profile-note', entryId: 'about' }],
},

// entries 数组的一个元素
{ id: 'notes', label: 'Notes', icon: 'projects', description: 'My notes',
  target: { kind: 'folder', ref: 'notes' }, startColumn: 'places' },
```

同样可以在 `documents` 中添加只读文档，并选择 `word` 或 `notepad`。桌面图标顺序由 `entries` 决定，`startColumn` 决定开始菜单位置。真正需要新内容格式时，在 `src/registry.ts` 的 `Target` 中新增类型，在 `src/viewers/` 添加查看器，再在 `src/viewers/index.tsx` 的 `ContentViewer` 中绑定。窗口管理器负责移动、缩放和层级，可以继续复用。

## 调整时区和查看日历

双击右下角时钟打开 **Date and Time Properties**。触屏轻点，键盘聚焦后按 Enter 或空格。**Date & Time** 显示所选时区的年月日和指针时钟，左右箭头可以翻月。切到 **Time Zone**，选国家或地区，再选城市，例如 United States → America/New York。点 **Apply** 观察任务栏日期和时间的变化，或点 **OK** 保存并关闭。**Cancel** 放弃上次应用之后的改动。

首次访问默认跟随设备。要让新访客默认看北京时间，在 `src/content/clock.ts` 把 `defaultTimeZone` 设为 `'Asia/Shanghai'`。填空字符串即可恢复设备默认值。访客自己的选择优先，保存在当前浏览器和站点地址下。夏令时由浏览器的时区数据库处理。国家与城市对应表来自 [IANA zone.tab](https://data.iana.org/time-zones/tzdb/zone.tab)。

## 播放和增加音乐

打开或刷新主页时，**About Me.doc** 显示在前台，**Windows Media Player** 在任务栏最小化，尝试播放巴赫《G 弦上的咏叹调》。如果浏览器要求先与网页互动，点击正文或轻点桌面即可开始。点击任务栏里的播放器可以还原窗口；右下角的小喇叭也可以暂停、切歌、调音量。音量和静音设置在刷新后保留，关闭播放器会停止播放。

进站曲默认单曲循环。暂停再继续、调整音量或还原窗口都会保留循环。主动切到另一首歌或打开其他文件后，本次访问改为按歌单顺序续播。刷新主页会重新从进站曲开始。后台按顺序续播时会跳过需要显示画面的 YouTube 条目。

**只在自己电脑上听。** 用播放器右上角的 **Open file…** 选择一个或多个音频或视频文件（例如 MP3、MP4）。浏览器从本机读取，文件只在当前页面的歌单中有效，刷新后需重新选择。

**永久加进网站歌单。** 把你有权公开分发的音频或 MV 放在 `public/media/music/`，在 `src/content/music.ts` 的 `playlist` 数组中加一项。调整数组顺序即可调整播放顺序。要更换进站音乐，把同一文件中的 `startupTrackId` 改成目标本地曲目的 `id`。视频把 `kind` 改成 `'video'`。按授权条件填写署名和来源。

```ts
{
  id: 'my-recording',
  title: '曲名',
  artist: '作曲者或艺人',
  local: { src: '/media/music/my-recording.mp3', kind: 'audio' },
  credit: { label: '演奏者或录音出处', url: 'https://example.org/recording' },
},
```

**加官方 YouTube MV。** 可以只填 `id`、`title`、`artist` 和 `youtubeId`。复制官方视频网址中 `watch?v=` 后面、下一个 `&` 前面的 ID。若同一条目也有获准分发的本地文件，可同时填写 `local`；播放器会优先读取本地文件，读取失败再尝试 YouTube。YouTube 只在播放器可见时播放；最小化、切到其他窗口或浏览器标签页，视频会暂停。嵌入受限或网络不可用时可以从曲目下方进入官方视频页。[YouTube 播放器政策](https://developers.google.com/youtube/terms/developer-policies)

| 现有曲目 | 网站使用的版本 |
| --- | --- |
| 贝多芬《第五交响曲》第一乐章 Allegro con brio | Skidmore College Orchestra 录音，来源页列明演奏者已将录音释入公有领域。[录音及授权](https://commons.wikimedia.org/wiki/File:Ludwig_van_Beethoven_-_symphony_no._5_in_c_minor,_op._67_-_i._allegro_con_brio.ogg) |
| 巴赫《D 大调第三号管弦组曲》第二乐章 Air，BWV 1068 | 美国空军乐队 Air Force Strings 演奏，2000 年《Collage》专辑。来源页载有美国空军对这份录音的公有领域声明。[录音及来源](https://commons.wikimedia.org/wiki/File:Air_-_Air_Force_Strings_-_United_States_Air_Force_Band.mp3) |
| Lady Gaga《Bad Romance》 | 播放站主提供的本地 MV，文件为 `public/media/music/bad-romance.mp4`。曲目下方保留艺人的视频链接。[官方视频](https://www.youtube.com/watch?v=qrO4YZeyl0I) |

## 在本地看效果

首次运行先执行 `npm ci`，再执行 `npm run dev`。打开终端打印的本地网址，保存内容文件后刷新即可预览。运行 `npm run build` 检查类型并打包，再用 `npm run preview` 检查生产版。逐个打开新项目、照片、CV 和外链，确认大小写和资源路径正确。这些操作都在本地进行。

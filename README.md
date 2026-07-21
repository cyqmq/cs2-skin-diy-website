# CS2 Skin DIY Website / CS2 武器皮肤预览工具

基于 Three.js 的浏览器端 CS2 武器皮肤预览工具。加载带正确 UV 映射的预烘焙纹理，在 3D 模型上实时显示皮肤效果。支持中英文切换。

A browser-based CS2 weapon skin preview tool. Displays pre-baked colored textures on CS2 GLB models with correct UV mapping. Supports Chinese/English bilingual switching.

## 功能 / Features

- **63 种武器型号**（含所有匕首/刀、手套），GLB 模型 + 预烘焙纹理
- **1620+ 个皮肤纹理**，三种来源（lielxd PNG → webp → export）
- **皮肤开关**：一键切换显示/隐藏皮肤纹理
- **模型切换**：Legacy / HD 网格切换
- **中英文语言切换**
- **鼠标拖拽旋转/缩放 3D 预览**
- **信息面板**：显示模型路径、纹理路径、PID、加载状态

## 快速开始 / Quick Start

```bash
# 克隆仓库
git clone https://github.com/cyqmq/cs2-skin-diy-website.git
cd cs2-skin-diy-website

# 安装依赖
npm install

# 下载纹理资源包（Release 页面下载后解压到项目根目录）
# https://github.com/cyqmq/cs2-skin-diy-website/releases
# 解压后应出现以下目录：
#   public/lielxd/
#   public/export/
#   webp/
#   public/environment.hdr

# 启动开发服务器
npx vite --host 0.0.0.0 --port 3001
```

浏览器打开 `http://localhost:3001`（或局域网 `http://192.168.5.10:3001`）。

## 数据来源 / Data Sources

| 来源 | 数量 | 格式 |
|------|------|------|
| `public/lielxd/` | 1620+ PIDs | 8-bit PNG (color + metalness) |
| `webp/` | 278 | .webp |
| `public/export/cs2_all_weapons/` | 230 GLB + 632 纹理 | .glb / .webp / .png |
| `public/export/cs2_nightwish/` | 附加模型 | .glb |

- 皮肤数据：基于 CSGO-API 的 `csgoapi.json`（中/英双语）
- 纹理来源：[LielXD/CS2-WeaponPaints-Website](https://github.com/LielXD/CS2-WeaponPaints-Website)
- 3D 模型：来自 CS2 游戏文件提取的 GLB

## 目录结构 / Project Structure

```
public/
├── data/               # JSON 数据文件
│   ├── index.json          # 武器 + 皮肤索引
│   ├── lielxd_manifest.json # 纹理清单
│   ├── csgoapi.json         # CSGO-API 英文数据
│   ├── csgoapi_zh.json      # CSGO-API 中文数据
│   └── csgoapi_en.json      # 英文别名数据
├── lielxd/             # 主要皮肤纹理（.png / .webp）→ 需下载
├── export/             # GLB 模型 + 嵌入式纹理 → 需下载
│   ├── cs2_all_weapons/
│   └── cs2_nightwish/
├── environment.hdr     # 环境光照贴图 → 需下载
└── ...
src/
├── components/
│   └── weapon-3d-viewer.tsx  # 3D 渲染组件
├── lib/
│   └── api.ts              # 数据加载 + 纹理解析
├── routes/
│   └── skin-painter.tsx    # 主页面（侧边栏 + 3D 预览）
├── ...
```

## 技术栈 / Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v8
- Three.js + @react-three/fiber + @react-three/drei

## 开发 / Development

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 已知限制 / Known Limitations

- 约 267 个枪/刀皮肤缺少纹理来源（在 lielxd 中没有对应贴图）
- 手套（handwraps/gloves）纹理暂不渲染
- Steam CDN 预览图在中国大陆可能无法加载，但不影响本地 3D 纹理显示

## 许可证 / License

MIT

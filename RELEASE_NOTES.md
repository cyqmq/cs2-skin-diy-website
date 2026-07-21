# v1.0.0 — CS2 武器皮肤预览工具

## 概要

基于 Three.js 的浏览器端 CS2 皮肤预览工具，63 种武器型号，1620+ 皮肤纹理。

## 更新内容

- 全面重写 3D 渲染组件：支持 Legacy/HD 网格切换、UV 映射修正
- 集成 CSGO-API 数据源（中/英文各 2106 条皮肤记录）
- lielxd 纹理集成：1620+ 个皮肤贴图（含 color + metalness）
- 新增纹理来源：webp / export 嵌入式纹理作为备选
- 重写侧边栏：分类展示武器、皮肤列表、状态指示
- 信息面板：显示模型路径、纹理路径、PID、加载状态
- 中英文语言切换支持
- 修复刀具（knife/bayonet）模型不可见问题（legacy 网格判断）
- 新增 5 种武器：negev / m249 / bayonet / knife_kukri / knife_navaja / knife_talon
- 新建清单：`当前缺少纹理的皮肤.txt` 列出 333 个尚缺来源的皮肤

## 数据统计

| 项目 | 数量 |
|------|------|
| 武器型号 | 63 |
| 皮肤总数（CSGO-API） | 2106 |
| 可用本地纹理 | 1620+ |
| 尚缺纹理 | 333（含 94 手套 + 239 枪/刀） |
| GLB 模型 | 230+ |
| 嵌入式纹理 | 632 |

## 安装

详见 README.md 的「快速开始」。

**纹理资源包**（需单独下载）：内含 `public/lielxd/`（3.9G）、`public/export/`（2.5G）、`webp/`（191M）、`public/environment.hdr`。下载 7z 分卷压缩包后解压到项目根目录。

## 技术栈

React 19 + TypeScript + Vite + Three.js / R3F + Tailwind CSS v4

## 已知问题

- 约 267 个枪/刀皮肤缺少纹理来源（列于 `当前缺少纹理的皮肤.txt`），待后续补充
- 手套纹理暂不渲染
- Steam CDN 预览图在中国大陆可能无法加载，但不影响本地 3D 纹理显示

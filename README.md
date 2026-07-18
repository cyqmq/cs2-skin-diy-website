# CS2 3D Skin Inspect

CS2 武器皮肤 3D 检视工具 - 浏览器端实时预览武器模型与涂装纹理。

## 技术栈

- React 19 + TypeScript
- Vite + Tailwind CSS v4
- React Router v8 (SPA mode)
- Three.js + @react-three/fiber + @react-three/drei

## 功能

- **68 种武器 3D 模型** — GLTF 格式，自 VPK 导出
- **皮肤纹理加载** — paint_index → albedo 纹理自动匹配
- **鼠标拖拽旋转** — 左键拖拽旋转模型，右键平移，滚轮缩放
- **CSGO-API 皮肤数据** — 武器分类、皮肤列表、稀有度颜色
- **颜色组背景** — 25 种 CSS 渐变色可选
- **Steam CDN 代理** — Vite 代理解决跨域纹理加载

## 快速开始

```bash
npm install
npm run dev
```

访问 `http://localhost:3001`

## 项目结构

```
src/
  components/weapon-3d-viewer.tsx   # 3D 武器查看器
  routes/skin-painter.tsx           # 主页面（三栏布局）
  routes/_layout.tsx                # 顶部导航
  lib/api.ts                        # CSGO-API 数据获取
  lib/textures.ts                   # 纹理路径查找
  lib/inspect_decoder.js            # CS2 检视链接解码器（参考）
  lib/skin_data.js                  # 皮肤图案数据（Fade/蓝宝石等级）
  gradients.ts                      # 25 种渐变色背景
public/
  models/                           # 68 武器 GLTF 模型
  paint_index_map.json              # paint_index → 纹理文件映射
  textures/                         # 从 VPK 提取的涂装纹理（符号链接）
```

## 纹理数据来源

涂装纹理从 CS2 `pak01_dir.vpk` 提取，使用 [ValveResourceFormat](https://github.com/ValveResourceFormat/ValveResourceFormat) 导出。

纹理路径映射表 `paint_index_map.json` 由提取工具自动生成。

## License

MIT

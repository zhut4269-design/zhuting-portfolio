# 朱婷 · 个人设计作品集（zhuting-portfolio）

个人设计师作品集网站，纯 HTML / CSS / JavaScript 单页实现，零构建、零依赖，可直接静态托管。

## 在线预览

- GitHub Pages：https://zhut4269-design.github.io/zhuting-portfolio/

## 内容构成

| 模块 | 说明 |
| --- | --- |
| 首页 / 作品网格 | 破格 12 列网格 + 错落排版，涵盖三维建模、UI 设计、平面设计、动效等 25 项作品 |
| 念念有词（焦点项目） | 儿童英语背单词 App 展示专区，含高清截图与产品宣传片（`assets/promo.mp4`，24s 竖版） |
| 互动演示 | `niannian-standalone.html` —— 单文件版背单词 App（素材全部 base64 内嵌，双击即可离线运行）；`niannian/` 为模块化原始版本（需 HTTP 环境打开） |

## 本地预览

```bash
# 任选其一：直接双击 index.html；
# 或用任意静态服务器：
npx serve .
python -m http.server 8000
```

## 目录结构

```
index.html                 # 作品集主页（单文件，含全部样式与脚本）
niannian-standalone.html   # 念念有词 App 单文件版（可离线双击运行）
niannian/                  # 念念有词 App 模块化原始版（src/ + assets/）
assets/                    # 作品图（work-01..25.jpg）、项目截图、宣传片与首屏视频
LICENSE                    # MIT
```

## 宣传片制作管线（简述）

`assets/promo.mp4` 由「确定性影棚」流程产出：单页 HTML 影棚（`renderAt(t)` 纯函数驱动画面）→ Playwright 逐帧截图（30fps）→ FFmpeg 合成视频与音效（lofi BGM 由 numpy 合成）。真实 App 演示段为 3 倍分辨率步进录屏，非 AI 生成界面。

## License

MIT © 2026 朱婷

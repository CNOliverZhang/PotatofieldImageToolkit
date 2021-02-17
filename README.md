# 洋芋田图像工具箱

> 一个适用于摄影从业者/爱好者、设计师等创意行业从业者的图像工具箱。

软件目前有如下工具：

- 图片加水印工具
- 长图拼接工具
- 图片裁剪工具
- 图片分割工具
- 富文本制图工具
- 尺寸调整工具
- 图片压缩工具
- 格式转换工具
- EXIF读取工具
- 色彩提取工具
- 字体管理工具

同时，软件具有自动更新功能，每次在软件启动时都会自动检查更新并询问用户是否更新；此外，用户也可以在“设置”页面主动检查更新。

## 使用发行版或自行编译

目前仅提供Windows平台的发行版。如果您是海外用户，可以[点此下载](https://github.com/CNOliverZhang/PotatofieldImageToolkit/releases/latest)；如果您是国内用户，请[点此下载](https://imagetoolkit.potatofield.cn/)。使用Mac和Linux的用户可以自行构建,自行构建需安装Node.js，克隆源码后在项目目录中执行：

```javascript
npm install
npm run build
```

## 详细介绍

您可以[访问网站](https://imagetoolkit.potatofield.cn)了解图文详情。

### 图片加水印工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/watermark.png)

能够为单张图片添加水印，也可以手动为多张图片依次添加水印，还可以设置好水印参数后自动批量添加水印。可以自行设置水印内容、颜色、字体、大小、角度和位置，几乎一切都可以随心自定义。

添加水印后导出的图片所见即所得，且处理迅速。在主流配置的轻薄本实测，由Sony A7R3拍摄的四千万像素的照片，每张处理时间大约1秒；尺寸较小的图片，每张处理时间普遍在0.5秒以内。

支持将各项水印参数保存为模板，以供下次直接使用；也可以直接通过模板编辑器新建模板和修改模板。已保存的模板可以导出为一串模板码并复制到剪贴板，也能从剪贴板重新将模板码还原成模板保存；通过将模板码与人分享，可以将精心制作的模板共享给他人。

### 长图拼接工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/splicer.png)

将多张图片拼合为一张长图，可以自定义内外边框的宽度、颜色和图片圆角。最大支持输出高度为16000像素的图片（更长的图片将会被压缩），基本能满足绝大多数人都需求，保证拼接后每张图片的清晰。同样可以将边框的各项参数保存为模板以及新建或编辑模板，也同样支持导入导出模板码的操作。

### 图片裁剪工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/cropper.png)

可以采用自由模式裁剪，可以采用预置的多种常用比例裁剪，也可以自定义比例裁剪。支持批量导入图片，在工作流程中能够维持裁剪设置和保存设置不变，提升效率。

### 图片分割工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/slicer.png)

将一张图片按行和列切割成多张小图，支持自定义行数和列数。可以优先确保每张小图为正方形并舍弃图片多余部分，也可以优先确保整张图片都被分割。支持批量分割图片。

### 富文本制图工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/textToImage.png)

利用内置的富文本编辑器创作文章或从其他编辑器（如Microsoft Word等）粘贴文章，之后自定义样式并输出成图片，对于需要在社交媒体（朋友圈、微博等）发布富文本内容的用户较为实用。

支持一级标题、二级标题、文本、粗体、斜体、、有序列表、无序列表、图片和段落引用，支持自定义每一类富文本内容的字体、字体大小、字体颜色、行距、外边距、对齐方式等各项内容，也支持全文背景和页面边距的自定义。

同样提供对于模板的完整支持（将参数保存为模板、新建模板、修改模板、导入导出模板等）。

### 尺寸调整工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/resizer.png)

将图片按照统一长边长度、统一宽边长度或统一缩放百分比的方式进行批量尺寸调整。同样具有良好的性能和稳定性，短时间内可以处理大量图片，也可以处理大尺寸图片。

### 图片压缩工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/compress.png)

对常用格式的图片文件进行压缩，减小文件体积。支持自定义输出质量。

### 格式转换工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/convert.png)

将图片文件转换为其他格式，支持 JPEG 文件和 PNG 文件以及 WEBP 文件之间的相互转化。

### EXIF读取工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/exif.png)

从 JPEG 文件中读取 EXIF 信息，支持相机制造商、型号等设备信息和曝光补偿、镜头焦距、光圈、快门、感光度等曝光参数以及作者、图像尺寸等图像文件信息。

### 色彩提取工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/palette.png)

从照片中提取色彩，可以获得最能代表照片的主题色以及由十种能代表照片基本色调的颜色组成的色板。支持将色板导出为图片，也可以将色板拼接在原图片下方导出。

### 字体管理工具

![预览图](https://files.potatofield.cn/ImageToolkit/Tools/Images/fonts.png)

管理本地（软件中）的字体，以及从在线字体库中下载字体。也可以更改本软件的界面字体，获得更加个性化的使用体验。

通过软件下载的字体可以在本软件的其他工具中使用，也可以通过浏览器下载字体安装到系统中。在线字体库的字体全部经过筛选，确保是商用免费字体，不会产生版权纠纷。

### 全部模板导入导出

除了部分工具支持将模板导入导出为模板码用于保存和分享外，还可以将所有工具的模板导出为备份文件以供备份和恢复。

## 相关开源项目

[Electron](https://github.com/electron/electron)

[electron-promise-ipc](https://github.com/sibnerian/electron-promise-ipc)

[electron-buider](https://github.com/electron-userland/electron-builder)

[Vue.js](https://github.com/vuejs/vue)

[Vue Router](https://github.com/vuejs/vue-router)

[Vuex](https://github.com/vuejs/vuex)

[Vuex Electron](https://github.com/vue-electron/vuex-electron)

[Element UI](https://github.com/ElemeFE/element)

[Font Awesome](https://github.com/FortAwesome/Font-Awesome)

[html2canvas](https://github.com/niklasvh/html2canvas)

[CKEditor 5](https://github.com/ckeditor/ckeditor5)

[EXIF.js](https://github.com/exif-js/exif-js)

[Cropper.js](https://github.com/fengyuanchen/cropperjs')

[Color Thief](https://github.com/lokesh/color-thief)

[Crypto-JS](https://github.com/brix/crypto-js)

<template>
  <div id="text-to-image-template">
    <div class="page-header">
      <div class="page-title">富文本制图工具 - 模板编辑器</div>
      <div class="control-button minimize" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div class="control-button maximize" @click="maximize">
        <object data="static/images/maximize.svg" type="image/svg+xml"></object>
      </div>
      <div class="control-button close" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <div id="content">
      <div id="left">
        <div id="back-button-container">
          <div id="back-button" @click="back">
            <span slot="label"><i class="fas fa-chevron-left"></i> 返回</span>
          </div>
        </div>
        <div id="preview-wrapper">
          <div id="preview-container">
            <div
              id="preview"
              :style="{
                'padding': padding + 'px',
                'background-color': backgroundColor
              }">
              <h2>洋芋田图像工具箱</h2>
              <p>洋芋田图像工具箱是一个基于 Electron 和 Vue.js 的具有多种图像相关功能的工具软件。目前它具有以下功能：</p>
              <h3>图片加水印工具</h3>
              <p>单张或批量为图片添加水印，支持自定义水印内容及样式。支持模板功能，能将水印内容和样式保存为模板。</p>
              <figure>
                <img src="static/sample/watermark.png" />
                <figcaption>图片加水印工具</figcaption>
              </figure>
              <h3>长图拼接工具</h3>
              <p>可以将若干图片拼接为一张长图，也能为单张图片添加简单边框。支持将拼图边框样式保存为模板。</p>
              <figure>
                <img src="static/sample/splicer.png" />
                <figcaption>长图拼接工具</figcaption>
              </figure>
              <h3>图片裁剪工具</h3>
              <p>对图片进行裁剪，可以采用自由模式裁剪，可以采用预置的多种常用比例裁剪，也可以自定义比例裁剪。</p>
              <figure>
                <img src="static/sample/cropper.png" />
                <figcaption>图片裁剪工具</figcaption>
              </figure>
              <h3>图片分割工具</h3>
              <p>将完整的图片分割为小块，可以自定义行数和列数。支持锁定每块为正方形，也支持批量分割图片。</p>
              <figure>
                <img src="static/sample/slicer.png" />
                <figcaption>图片分割工具</figcaption>
              </figure>
              <h3>富文本制图工具</h3>
              <p>将富文本内容输出为图片，支持文本、标题、项目列表、图片和引用内容。支持自定义样式，支持模板功能。</p>
              <figure>
                <img src="static/sample/textToImage.png" />
                <figcaption>富文本制图工具</figcaption>
              </figure>
              <h3>尺寸调整工具</h3>
              <p>对图片进行批量调整大小的操作，支持固定缩放比例、固定图片长边和固定图片短边三种模式。</p>
              <figure>
                <img src="static/sample/resizer.png" />
                <figcaption>尺寸调整工具</figcaption>
              </figure>
              <h3>图片压缩工具</h3>
              <p>对常用格式的图片文件进行压缩，减小文件体积。支持自定义输出质量。</p>
              <figure>
                <img src="static/sample/compress.png" />
                <figcaption>图片压缩工具</figcaption>
              </figure>
              <h3>格式转换工具</h3>
              <p>将图片文件转换为其他格式，支持 JPEG 文件和 PNG 文件以及 WEBP 文件之间的相互转化。</p>
              <figure>
                <img src="static/sample/convert.png" />
                <figcaption>格式转换工具</figcaption>
              </figure>
              <h3>EXIF 读取工具</h3>
              <p>从 JPEG 文件中读取 EXIF 信息，支持相机制造商、型号等设备信息和曝光补偿、镜头焦距、光圈、快门、感光度等曝光参数。</p>
              <figure>
                <img src="static/sample/exif.png" />
                <figcaption>EXIF 读取工具</figcaption>
              </figure>
              <h3>色彩提取工具</h3>
              <p>从照片中提取色彩，可以获得最能代表照片的主题色以及由十种能代表照片基本色调的颜色组成的色板。</p>
              <figure>
                <img src="static/sample/palette.png" />
                <figcaption>色彩提取工具</figcaption>
              </figure>
              <h3>字体管理工具</h3>
              <p>管理本地字体库，还可以从在线字体库中下载字体。支持将下载的字体用于其他工具，也能设为界面字体。</p>
              <figure>
                <img src="static/sample/fonts.png" />
                <figcaption>字体管理工具</figcaption>
              </figure>
              <blockquote>
                <p>洋芋田图像工具箱基于 MIT 协议开源。目前提供适用于 Windows 的构建版本，使用其他平台的用户可以自行下载源码并构建。</p>
              </blockquote>
              <figure>
                <img src="static/sample/settings.png" />
              </figure>
              <p>洋芋田图像工具箱在开发过程中使用了下列开源组件和库：</p>
              <ul>
                <li>Electron</li>
                <li>electron-promise-ipc</li>
                <li>electron-buider</li>
                <li>Vue.js</li>
                <li>Vue Router</li>
                <li>Vuex</li>
                <li>Vuex Electron</li>
                <li>Element UI</li>
                <li>Font Awesome</li>
                <li>html2canvas</li>
                <li>CKEditor 5</li>
                <li>EXIF.js</li>
                <li>Cropper.js</li>
                <li>Color Thief</li>
                <li>Crypto-JS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div id="right">
        <el-tabs type="card" tab-position="top" id="tabs">
          <el-tab-pane>
            <span slot="label">设置</span>
            <div id="config">
              <div>
                <div class="row">
                  <div class="subtitle">样式设置</div>
                </div>
                <el-collapse value="basic" accordion>
                  <el-collapse-item title="基本样式" name="basic">
                    <div class="control-row">
                      <div class="text">外边距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="padding"
                        class="full-width-control"
                        :min="0"
                        :max="30"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">背景颜色</div>
                      <el-color-picker v-model="backgroundColor" size="mini"></el-color-picker>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="标题样式" name="title">
                    <div class="control-row">
                      <div class="text">字体</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="titleFont" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option
                          v-for="(font, index) in this.$store.state.fonts.fontList"
                          :key="index"
                          :label="font.verbose + '（' + font.style + '）'"
                          :value="font.fontFamily"
                          :style="{
                            'font-family': font.fontFamily
                          }"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">字体大小</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="titleFontSize"
                        class="full-width-control"
                        :min="15"
                        :max="100"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">字间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="titleLetterSpacing"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">行距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="titleLineHeight"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">段间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="titleMargin"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">对齐方式</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="titleTextAlign" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option label="左对齐" value="justify"/>
                        <el-option label="居中对齐" value="center"/>
                        <el-option label="右对齐" value="right"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">缩进设置</div>
                    </div>
                    <div class="control-row">
                      <el-switch
                        v-model="titleIndent"
                        active-text="缩进"
                        inactive-text="不缩进"
                        class="full-width-control"></el-switch>
                    </div>
                    <div class="control-row">
                      <div class="text">字体颜色</div>
                      <el-color-picker v-model="titleColor" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="二级标题样式" name="subtitle">
                    <div class="control-row">
                      <div class="text">字体</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="subtitleFont" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option
                          v-for="(font, index) in this.$store.state.fonts.fontList"
                          :key="index"
                          :label="font.verbose + '（' + font.style + '）'"
                          :value="font.fontFamily"
                          :style="{
                            'font-family': font.fontFamily
                          }"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">字体大小</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="subtitleFontSize"
                        class="full-width-control"
                        :min="10"
                        :max="80"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">字间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="subtitleLetterSpacing"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">行距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="subtitleLineHeight"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">段间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="subtitleMargin"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">对齐方式</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="subtitleTextAlign" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option label="左对齐" value="justify"/>
                        <el-option label="居中对齐" value="center"/>
                        <el-option label="右对齐" value="right"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">缩进设置</div>
                    </div>
                    <div class="control-row">
                      <el-switch
                        v-model="subtitleIndent"
                        active-text="缩进"
                        inactive-text="不缩进"
                        class="full-width-control"></el-switch>
                    </div>
                    <div class="control-row">
                      <div class="text">字体颜色</div>
                      <el-color-picker v-model="subtitleColor" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="文本样式" name="text">
                    <div class="control-row">
                      <div class="text">字体</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="textFont" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option
                          v-for="(font, index) in this.$store.state.fonts.fontList"
                          :key="index"
                          :label="font.verbose + '（' + font.style + '）'"
                          :value="font.fontFamily"
                          :style="{
                            'font-family': font.fontFamily
                          }"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">字体大小</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="textFontSize"
                        class="full-width-control"
                        :min="5"
                        :max="60"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">字间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="textLetterSpacing"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">行距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="textLineHeight"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">段间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="textMargin"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">对齐方式</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="textAlign" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option label="左对齐" value="justify"/>
                        <el-option label="居中对齐" value="center"/>
                        <el-option label="右对齐" value="right"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">段首缩进设置</div>
                    </div>
                    <div class="control-row">
                      <el-switch
                        v-model="textIndent"
                        active-text="缩进"
                        inactive-text="不缩进"
                        class="full-width-control"></el-switch>
                    </div>
                    <div class="control-row">
                      <div class="text">字体颜色</div>
                      <el-color-picker v-model="textColor" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="有序列表样式" name="orderedList">
                    <div class="control-row">
                      <div class="text">字体</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="orderedListFont" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option
                          v-for="(font, index) in this.$store.state.fonts.fontList"
                          :key="index"
                          :label="font.verbose + '（' + font.style + '）'"
                          :value="font.fontFamily"
                          :style="{
                            'font-family': font.fontFamily
                          }"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">字体大小</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="orderedListFontSize"
                        class="full-width-control"
                        :min="5"
                        :max="60"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">字间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="orderedListLetterSpacing"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">行距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="orderedListLineHeight"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">项目间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="orderedListItemMargin"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">段间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="orderedListMargin"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">缩进设置</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="orderedListIndent"
                        class="full-width-control"
                        :min="1"
                        :max="5"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">字体颜色</div>
                      <el-color-picker v-model="orderedListColor" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="无序列表样式" name="unorderdList">
                    <div class="control-row">
                      <div class="text">字体</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="orderedListFont" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option
                          v-for="(font, index) in this.$store.state.fonts.fontList"
                          :key="index"
                          :label="font.verbose + '（' + font.style + '）'"
                          :value="font.fontFamily"
                          :style="{
                            'font-family': font.fontFamily
                          }"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">字体大小</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="unorderedListFontSize"
                        class="full-width-control"
                        :min="5"
                        :max="60"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">字间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="unorderedListLetterSpacing"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">行距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="unorderedListLineHeight"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">项目间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="unorderedListItemMargin"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">段间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="unorderedListMargin"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">缩进设置</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="unorderedListIndent"
                        class="full-width-control"
                        :min="1"
                        :max="5"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">字体颜色</div>
                      <el-color-picker v-model="unorderedListColor" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="其他元素样式" name="other">
                    <div class="control-row">
                      <div class="text">图片圆角</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="imageBorderRadius"
                        class="full-width-control"
                        :min="0"
                        :max="30"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">图片段间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="imageMargin"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">注释字体</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="imageLabelFont" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option
                          v-for="(font, index) in this.$store.state.fonts.fontList"
                          :key="index"
                          :label="font.verbose + '（' + font.style + '）'"
                          :value="font.fontFamily"
                          :style="{
                            'font-family': font.fontFamily
                          }"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">注释字体大小</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="imageLabelFontSize"
                        class="full-width-control"
                        :min="3"
                        :max="40"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">注释字间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="imageLabelLetterSpacing"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">注释字体颜色</div>
                      <el-color-picker v-model="imageLabelColor" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                    <div class="control-row">
                      <div class="text">引用段间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="blockquoteMargin"
                        class="full-width-control"
                        :min="0"
                        :max="3"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">引用标示颜色</div>
                      <el-color-picker v-model="blockquoteBorderColor" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                  </el-collapse-item>
                </el-collapse>
                <div id="name">
                  <div class="row">
                    <div class="subtitle">模板名称设置</div>
                  </div>
                  <el-input v-model="templateTitle" placeholder="请输入模板标题" size="mini"></el-input>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div id="actions">
          <el-button v-if="index != -1" type="primary" size="mini" @click="save" class="bar-button">保存</el-button>
          <el-button type="primary" size="mini" @click="saveAsNew" class="bar-button">{{ index == -1 ? '保存' : '另存'}}</el-button>
          <el-button v-if="index != -1" type="primary" size="mini" @click="deleteTemplate" class="bar-button">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'textToImageTemplate',
  data () {
    return  {
      templateTitle: '',
      index: this.$route.query.index,
      padding: 20,
      backgroundColor: '#303133',
      titleFont: this.$store.state.fonts.defaultFont,
      titleFontSize: 24,
      titleLetterSpacing: 0.3,
      titleLineHeight: 1.8,
      titleMargin: 0.5,
      titleTextAlign: 'justify',
      titleIndent: false,
      titleColor: 'rgba(255, 255, 255, 1)',
      subtitleFont: this.$store.state.fonts.defaultFont,
      subtitleFontSize: 18,
      subtitleLetterSpacing: 0.1,
      subtitleLineHeight: 1.8,
      subtitleMargin: 0.5,
      subtitleTextAlign: 'justify',
      subtitleIndent: false,
      subtitleColor: 'rgba(255, 255, 255, 1)',
      textFont: this.$store.state.fonts.defaultFont,
      textFontSize: 14,
      textLetterSpacing: 0,
      textLineHeight: 1.8,
      textMargin: 0.5,
      textAlign: 'justify',
      textIndent: true,
      textColor: 'rgba(255, 255, 255, 1)',
      orderedListFont: this.$store.state.fonts.defaultFont,
      orderedListFontSize: 14,
      orderedListLetterSpacing: 0,
      orderedListLineHeight: 1.8,
      orderedListMargin: 0.5,
      orderedListItemMargin: 0,
      orderedListIndent: 2,
      orderedListColor: 'rgba(255, 255, 255, 1)',
      unorderedListFont: this.$store.state.fonts.defaultFont,
      unorderedListFontSize: 14,
      unorderedListLetterSpacing: 0,
      unorderedListLineHeight: 1.8,
      unorderedListMargin: 0.5,
      unorderedListItemMargin: 0,
      unorderedListIndent: 2,
      unorderedListColor: 'rgba(255, 255, 255, 1)',
      imageBorderRadius: 0,
      imageMargin: 0.5,
      imageLabelFont: this.$store.state.fonts.defaultFont,
      imageLabelFontSize: 12,
      imageLabelLetterSpacing: 0,
      imageLabelColor: 'rgba(192, 196, 204, 1)',
      blockquoteMargin: 0.5,
      blockquoteBorderColor: 'rgba(220, 223, 230, 1)'
    }
  },
  watch: {
    titleFont: (value) => {
      document.getElementById('preview').style.setProperty('--title-font', value)
    },
    titleFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--title-font-size', String(value) + 'px')
    },
    titleLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--title-letter-spacing', String(value) + 'em')
    },
    titleLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--title-line-height', String(value) + 'em')
    },
    titleMargin: (value) => {
      document.getElementById('preview').style.setProperty('--title-margin', String(value) + 'em')
    },
    titleTextAlign: (value) => {
      document.getElementById('preview').style.setProperty('--title-text-align', value)
    },
    titleIndent: (value) => {
      let indent = value ? '2em' : '0'
      document.getElementById('preview').style.setProperty('--title-indent', indent)
    },
    titleColor: (value) => {
      document.getElementById('preview').style.setProperty('--title-color', value)
    },
    subtitleFont: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-font', value)
    },
    subtitleFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-font-size', String(value) + 'px')
    },
    subtitleLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-letter-spacing', String(value) + 'em')
    },
    subtitleLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-line-height', String(value) + 'em')
    },
    subtitleMargin: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-margin', String(value) + 'em')
    },
    subtitleTextAlign: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-text-align', value)
    },
    subtitleIndent: (value) => {
      let indent = value ? '2em' : '0'
      document.getElementById('preview').style.setProperty('--subtitle-indent', indent)
    },
    subtitleColor: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-color', value)
    },
    textFont: (value) => {
      document.getElementById('preview').style.setProperty('--text-font', value)
    },
    textFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--text-font-size', String(value) + 'px')
    },
    textLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--text-letter-spacing', String(value) + 'em')
    },
    textLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--text-line-height', String(value) + 'em')
    },
    textMargin: (value) => {
      document.getElementById('preview').style.setProperty('--text-margin', String(value) + 'em')
    },
    textAlign: (value) => {
      document.getElementById('preview').style.setProperty('--text-align', value)
    },
    textIndent: (value) => {
      let indent = value ? '2em' : '0'
      document.getElementById('preview').style.setProperty('--text-indent', indent)
    },
    textColor: (value) => {
      document.getElementById('preview').style.setProperty('--text-color', value)
    },
    orderedListFont: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-font', value)
    },
    orderedListFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-font-size', String(value) + 'px')
    },
    orderedListLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-letter-spacing', String(value) + 'em')
    },
    orderedListLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-line-height', String(value) + 'em')
    },
    orderedListMargin: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-margin', String(value) + 'em')
    },
    orderedListItemMargin: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-item-margin', String(value) + 'em')
    },
    orderedListIndent: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-indent', String(value) + 'em')
    },
    orderedListColor: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-color', value)
    },
    unorderedListFont: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-font', value)
    },
    unorderedListFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-font-size', String(value) + 'px')
    },
    unorderedListLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-letter-spacing', String(value) + 'em')
    },
    unorderedListLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-line-height', String(value) + 'em')
    },
    unorderedListMargin: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-margin', String(value) + 'em')
    },
    unorderedListItemMargin: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-item-margin', String(value) + 'em')
    },
    unorderedListIndent: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-indent', String(value) + 'em')
    },
    unorderedListColor: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-color', value)
    },
    imageBorderRadius: (value) => {
      document.getElementById('preview').style.setProperty('--image-border-radius', String(value) + 'px')
    },
    imageMargin: (value) => {
      document.getElementById('preview').style.setProperty('--image-margin', String(value) + 'em')
    },
    imageLabelFont: (value) => {
      document.getElementById('preview').style.setProperty('--image-label-font', value)
    },
    imageLabelFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--image-label-font-size', String(value) + 'px')
    },
    imageLabelLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--image-label-letter-spacing', String(value) + 'em')
    },
    imageLabelColor: (value) => {
      document.getElementById('preview').style.setProperty('--image-label-color', value)
    },
    blockquoteMargin: (value) => {
      document.getElementById('preview').style.setProperty('--blockquote-margin', String(value) + 'em')
    },
    blockquoteBorderColor: (value) => {
      document.getElementById('preview').style.setProperty('--blockquote-border-color', value)
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    maximize() {
      ipcRenderer.send('change-maximize-status')
    },
    back() {
      this.$router.replace('/textToImage')
    },
    close() {
      ipcRenderer.send('close')
      this.$destroy()
    },
    deleteTemplate(index) {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: (index) => {
          this.$store.dispatch('textToImage/templateDelete', index)
          this.back()
        }
      })
    },
    save() {
      let template =  {
        title: this.templateTitle,
        padding: this.padding,
        backgroundColor: this.backgroundColor,
        titleFont: this.titleFont,
        titleFontSize: this.titleFontSize,
        titleLetterSpacing: this.titleLetterSpacing,
        titleLineHeight: this.titleLineHeight,
        titleMargin: this.titleMargin,
        titleTextAlign: this.titleTextAlign,
        titleIndent: this.titleIndent,
        titleColor: this.titleColor,
        subtitleFont: this.subtitleFont,
        subtitleFontSize: this.subtitleFontSize,
        subtitleLetterSpacing: this.subtitleLetterSpacing,
        subtitleLineHeight: this.subtitleLineHeight,
        subtitleMargin: this.subtitleMargin,
        subtitleTextAlign: this.subtitleTextAlign,
        subtitleIndent: this.subtitleIndent,
        subtitleColor: this.subtitleColor,
        textFont: this.textFont,
        textFontSize: this.textFontSize,
        textLetterSpacing: this.textLetterSpacing,
        textLineHeight: this.textLineHeight,
        textMargin: this.textMargin,
        textAlign: this.textAlign,
        textIndent: this.textIndent,
        textColor: this.textColor,
        orderedListFont: this.orderedListFont,
        orderedListFontSize: this.orderedListFontSize,
        orderedListLetterSpacing: this.orderedListLetterSpacing,
        orderedListLineHeight: this.orderedListLineHeight,
        orderedListMargin: this.orderedListMargin,
        orderedListItemMargin: this.orderedListItemMargin,
        orderedListIndent: this.orderedListIndent,
        orderedListColor: this.orderedListColor,
        unorderedListFont: this.unorderedListFont,
        unorderedListFontSize: this.unorderedListFontSize,
        unorderedListLetterSpacing: this.unorderedListLetterSpacing,
        unorderedListLineHeight: this.unorderedListLineHeight,
        unorderedListMargin: this.unorderedListMargin,
        unorderedListItemMargin: this.unorderedListItemMargin,
        unorderedListIndent: this.unorderedListIndent,
        unorderedListColor: this.unorderedListColor,
        imageBorderRadius: this.imageBorderRadius,
        imageMargin: this.imageMargin,
        imageLabelFont: this.imageLabelFont,
        imageLabelFontSize: this.imageLabelFontSize,
        imageLabelLetterSpacing: this.imageLabelLetterSpacing,
        imageLabelColor: this.imageLabelColor,
        blockquoteMargin: this.blockquoteMargin,
        blockquoteBorderColor: this.blockquoteBorderColor
      }
      let checkName = (title) => {
        if (title == '') {
          this.$dialog({
            type: 'error',
            title: '错误',
            text: '请输入模板标题，否则无法保存该模板。',
            showCancel: true,
            confirmFunction: () => {
              this.$dialog({
                title: '请输入样式模板标题',
                content: this.$createElement('div', {
                  'class': 'el-input el-input--mini'
                }, [
                  this.$createElement('input', {
                    'dom-props': {
                      value: this.templateTitle,
                    },
                    'on': {
                      input: (event) => {
                        this.templateTitle = event.target.value
                      }
                    },
                    'class': 'el-input__inner',
                    'style': {
                      'font-family': 'var(--main-font)'
                    }
                  })
                ]),
                showCancel: true,
                confirmFunction: () => {
                  checkName(this.templateTitle)
                  this.templateTitle = ''
                },
                cancelFunction: () => {
                  this.templateTitle = ''
                }
              })
            }
          })
        } else {
          for (let i = 0; i < this.$store.state.textToImage.templates.length; i++) {
            if (title == this.$store.state.textToImage.templates[i].title && this.index != i) {
              this.$dialog({
                type: 'warning',
                title: '需要重命名',
                text: '已存在同名模板，您需要更改当前模板的标题才能将其保存。',
                showCancel: true,
                confirmFunction: () => {
                  this.$dialog({
                    title: '请输入样式模板标题',
                    content: this.$createElement('div', {
                      'class': 'el-input el-input--mini'
                    }, [
                      this.$createElement('input', {
                        'dom-props': {
                          value: this.templateTitle,
                        },
                        'on': {
                          input: (event) => {
                            this.templateTitle = event.target.value
                          }
                        },
                        'class': 'el-input__inner',
                        'style': {
                          'font-family': 'var(--main-font)'
                        }
                      })
                    ]),
                    showCancel: true,
                    confirmFunction: () => {
                      checkName(this.templateTitle)
                      this.templateTitle = ''
                    },
                    cancelFunction: () => {
                      this.templateTitle = ''
                    }
                  })
                }
              })
              return
            }
          }
          template.title = title
          this.$store.dispatch('textToImage/templatePush', {
            index: this.index,
            template: template
          })
          this.$dialog({
            type: 'success',
            title: '成功',
            text: '保存成功。是否返回？',
            showCancel: true,
            confirmFunction: () => {
              this.back()
            }
          })
        }
      }
      checkName(this.templateTitle)
    },
    saveAsNew() {
      let template =  {
        title: this.templateTitle,
        padding: this.padding,
        backgroundColor: this.backgroundColor,
        titleFont: this.titleFont,
        titleFontSize: this.titleFontSize,
        titleLetterSpacing: this.titleLetterSpacing,
        titleLineHeight: this.titleLineHeight,
        titleMargin: this.titleMargin,
        titleTextAlign: this.titleTextAlign,
        titleIndent: this.titleIndent,
        titleColor: this.titleColor,
        subtitleFont: this.subtitleFont,
        subtitleFontSize: this.subtitleFontSize,
        subtitleLetterSpacing: this.subtitleLetterSpacing,
        subtitleLineHeight: this.subtitleLineHeight,
        subtitleMargin: this.subtitleMargin,
        subtitleTextAlign: this.subtitleTextAlign,
        subtitleIndent: this.subtitleIndent,
        subtitleColor: this.subtitleColor,
        textFont: this.textFont,
        textFontSize: this.textFontSize,
        textLetterSpacing: this.textLetterSpacing,
        textLineHeight: this.textLineHeight,
        textMargin: this.textMargin,
        textAlign: this.textAlign,
        textIndent: this.textIndent,
        textColor: this.textColor,
        orderedListFont: this.orderedListFont,
        orderedListFontSize: this.orderedListFontSize,
        orderedListLetterSpacing: this.orderedListLetterSpacing,
        orderedListLineHeight: this.orderedListLineHeight,
        orderedListMargin: this.orderedListMargin,
        orderedListItemMargin: this.orderedListItemMargin,
        orderedListIndent: this.orderedListIndent,
        orderedListColor: this.orderedListColor,
        unorderedListFont: this.unorderedListFont,
        unorderedListFontSize: this.unorderedListFontSize,
        unorderedListLetterSpacing: this.unorderedListLetterSpacing,
        unorderedListLineHeight: this.unorderedListLineHeight,
        unorderedListMargin: this.unorderedListMargin,
        unorderedListItemMargin: this.unorderedListItemMargin,
        unorderedListIndent: this.unorderedListIndent,
        unorderedListColor: this.unorderedListColor,
        imageBorderRadius: this.imageBorderRadius,
        imageMargin: this.imageMargin,
        imageLabelFont: this.imageLabelFont,
        imageLabelFontSize: this.imageLabelFontSize,
        imageLabelLetterSpacing: this.imageLabelLetterSpacing,
        imageLabelColor: this.imageLabelColor,
        blockquoteMargin: this.blockquoteMargin,
        blockquoteBorderColor: this.blockquoteBorderColor
      }
      let checkName = (title) => {
        if (title == '') {
          this.$dialog({
            type: 'error',
            title: '错误',
            text: '请输入模板标题，否则无法保存该模板。',
            showCancel: true,
            confirmFunction: () => {
              this.$dialog({
                title: '请输入样式模板标题',
                content: this.$createElement('div', {
                  'class': 'el-input el-input--mini'
                }, [
                  this.$createElement('input', {
                    'dom-props': {
                      value: this.templateTitle,
                    },
                    'on': {
                      input: (event) => {
                        this.templateTitle = event.target.value
                      }
                    },
                    'class': 'el-input__inner',
                    'style': {
                      'font-family': 'var(--main-font)'
                    }
                  })
                ]),
                showCancel: true,
                confirmFunction: () => {
                  checkName(this.templateTitle)
                  this.templateTitle = ''
                },
                cancelFunction: () => {
                  this.templateTitle = ''
                }
              })
            }
          })
        } else {
          for (let i = 0; i < this.$store.state.textToImage.templates.length; i++) {
            if (title == this.$store.state.textToImage.templates[i].title) {
              this.$dialog({
                type: 'warning',
                title: '需要重命名',
                text: '已存在同名模板，您需要更改当前模板的标题才能将其保存。',
                showCancel: true,
                confirmFunction: () => {
                  this.$dialog({
                    title: '请输入样式模板标题',
                    content: this.$createElement('div', {
                      'class': 'el-input el-input--mini'
                    }, [
                      this.$createElement('input', {
                        'dom-props': {
                          value: this.templateTitle,
                        },
                        'on': {
                          input: (event) => {
                            this.templateTitle = event.target.value
                          }
                        },
                        'class': 'el-input__inner',
                        'style': {
                          'font-family': 'var(--main-font)'
                        }
                      })
                    ]),
                    showCancel: true,
                    confirmFunction: () => {
                      checkName(this.templateTitle)
                      this.templateTitle = ''
                    },
                    cancelFunction: () => {
                      this.templateTitle = ''
                    }
                  })
                }
              })
              return
            }
          }
          template.title = title
          this.$store.dispatch('textToImage/templatePush', template)
          this.$dialog({
            type: 'success',
            title: '成功',
            text: '保存成功。是否返回？',
            showCancel: true,
            confirmFunction: () => {
              this.back()
            },
            cancelFunction: () => {
              this.index = this.$store.state.splicer.templates.length - 1
            }
          })
        }
      }
      checkName(this.templateTitle)
    }
  },
  mounted() {
    if (this.$route.query.index != -1) {
      let template = this.$store.state.textToImage.templates[this.$route.query.index]
      this.templateTitle = template.title !== undefined ? template.title : this.templateTitle
      this.padding = template.padding !== undefined ? template.padding : this.padding
      this.backgroundColor = template.backgroundColor !== undefined ? template.backgroundColor : this.backgroundColor
      this.titleFont = template.titleFont !== undefined ? template.titleFont : this.titleFont
      this.titleFontSize = template.titleFontSize !== undefined ? template.titleFontSize : this.titleFontSize
      this.titleLetterSpacing = template.titleLetterSpacing !== undefined ? template.titleLetterSpacing : this.titleLetterSpacing
      this.titleLineHeight = template.titleLineHeight !== undefined ? template.titleLineHeight : this.titleLineHeight
      this.titleMargin = template.titleMargin !== undefined ? template.titleMargin : this.titleMargin
      this.titleTextAlign = template.titleTextAlign !== undefined ? template.titleTextAlign : this.titleTextAlign
      this.titleIndent = template.titleIndent !== undefined ? template.titleIndent : this.titleIndent
      this.titleColor = template.titleColor !== undefined ? template.titleColor : this.titleColor
      this.subtitleFont = template.subtitleFont !== undefined ? template.subtitleFont : this.subtitleFont
      this.subtitleFontSize = template.subtitleFontSize !== undefined ? template.subtitleFontSize : this.subtitleFontSize
      this.subtitleLetterSpacing = template.subtitleLetterSpacing !== undefined ? template.subtitleLetterSpacing : this.subtitleLetterSpacing
      this.subtitleLineHeight = template.subtitleLineHeight !== undefined ? template.subtitleLineHeight : this.subtitleLineHeight
      this.subtitleMargin = template.subtitleMargin !== undefined ? template.subtitleMargin : this.subtitleMargin
      this.subtitleTextAlign = template.subtitleTextAlign !== undefined ? template.subtitleTextAlign : this.subtitleTextAlign
      this.subtitleIndent = template.subtitleIndent !== undefined ? template.subtitleIndent : this.subtitleIndent
      this.subtitleColor = template.subtitleColor !== undefined ? template.subtitleColor : this.subtitleColor
      this.textFont = template.textFont !== undefined ? template.textFont : this.textFont
      this.textFontSize = template.textFontSize !== undefined ? template.textFontSize : this.textFontSize
      this.textLetterSpacing = template.textLetterSpacing !== undefined ? template.textLetterSpacing : this.textLetterSpacing
      this.textLineHeight = template.textLineHeight !== undefined ? template.textLineHeight : this.textLineHeight
      this.textMargin = template.textMargin !== undefined ? template.textMargin : this.textMargin
      this.textAlign = template.textAlign !== undefined ? template.textAlign : this.textAlign
      this.textIndent = template.textIndent !== undefined ? template.textIndent : this.textIndent
      this.textColor = template.textColor !== undefined ? template.textColor : this.textColor
      this.orderedListFont = template.orderedListFont !== undefined ? template.orderedListFont : this.orderedListFont
      this.orderedListFontSize = template.orderedListFontSize !== undefined ? template.orderedListFontSize : this.orderedListFontSize
      this.orderedListLetterSpacing = template.orderedListLetterSpacing !== undefined ? template.orderedListLetterSpacing : this.orderedListLetterSpacing
      this.orderedListLineHeight = template.orderedListLineHeight !== undefined ? template.orderedListLineHeight : this.orderedListLineHeight
      this.orderedListMargin = template.orderedListMargin !== undefined ? template.orderedListMargin : this.orderedListMargin
      this.orderedListItemMargin = template.orderedListItemMargin !== undefined ? template.orderedListItemMargin : this.orderedListItemMargin
      this.orderedListIndent = template.orderedListIndent !== undefined ? template.orderedListIndent : this.orderedListIndent
      this.orderedListColor = template.orderedListColor !== undefined ? template.orderedListColor : this.orderedListColor
      this.unorderedListFont = template.unorderedListFont !== undefined ? template.unorderedListFont : this.unorderedListFont
      this.unorderedListFontSize = template.unorderedListFontSize !== undefined ? template.unorderedListFontSize : this.unorderedListFontSize
      this.unorderedListLetterSpacing = template.unorderedListLetterSpacing !== undefined ? template.unorderedListLetterSpacing : this.unorderedListLetterSpacing
      this.unorderedListLineHeight = template.unorderedListLineHeight !== undefined ? template.unorderedListLineHeight : this.unorderedListLineHeight
      this.unorderedListMargin = template.unorderedListMargin !== undefined ? template.unorderedListMargin : this.unorderedListMargin
      this.unorderedListItemMargin = template.unorderedListItemMargin !== undefined ? template.unorderedListItemMargin : this.unorderedListItemMargin
      this.unorderedListIndent = template.unorderedListIndent !== undefined ? template.unorderedListIndent : this.unorderedListIndent
      this.unorderedListColor = template.unorderedListColor !== undefined ? template.unorderedListColor : this.unorderedListColor
      this.imageBorderRadius = template.imageBorderRadius !== undefined ? template.imageBorderRadius : this.imageBorderRadius
      this.imageMargin = template.imageMargin !== undefined ? template.imageMargin : this.imageMargin
      this.imageLabelFont = template.imageLabelFont !== undefined ? template.imageLabelFont : this.imageLabelFont
      this.imageLabelFontSize = template.imageLabelFontSize !== undefined ? template.imageLabelFontSize : this.imageLabelFontSize
      this.imageLabelLetterSpacing = template.imageLabelLetterSpacing !== undefined ? template.imageLabelLetterSpacing : this.imageLabelLetterSpacing
      this.imageLabelColor = template.imageLabelColor !== undefined ? template.imageLabelColor : this.imageLabelColor
      this.blockquoteMargin = template.blockquoteMargin !== undefined ? template.blockquoteMargin : this.blockquoteMargin
      this.blockquoteBorderColor = template.blockquoteBorderColor !== undefined ? template.blockquoteBorderColor : this.blockquoteBorderColor
      this.$dialog({
        text: '您正在编辑一个已保存的模板。如果您希望修改后覆盖原模板请点击“保存”，如果您希望将修改后的模板存储为副本请点击“另存”。'
      })
    }
  }
}
</script>

<style lang="scss">  
#text-to-image-template {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  #content {
    height: 0;
    flex-grow: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  #left {
    flex-grow: 1;
    height: 100%;
    display: flex;
    flex-direction: column;

    #back-button-container {
      width: 100%;
      height: 50px;
      line-height: 50px;
      text-align: center;
      background-color: var(--main-color);

      #back-button {
        width: 100px;
        height: 50px;
        position: relative;
        line-height: 50px;
        text-align: center;
        font-size: 14px;
        color: var(--white);
        cursor: pointer;

        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          transition: 0.2s;
        }

        &:hover::after {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }
    }

    #preview-wrapper {
      width: 100%;
      height: 0;
      flex-grow: 1;
      padding-left: 20px;
      padding-top: 20px;
      padding-bottom: 20px;
      box-sizing: border-box;
      
      #preview-container {
        width: 100%;
        height: 100%;
        border-color: var(--light-gray);
        border-style: solid;
        border-width: 1px;
        border-radius: 6px;
        box-sizing: border-box;
        overflow-x: hidden;
        overflow-y: auto;
        text-align: center;
        background-color: var(--black-gray);
        
        #preview {
          width: 400px;
          display: inline-flex;
          flex-direction: column;
          box-sizing: border-box;
          color: var(--white);
          margin-bottom: 0;
          margin-top: 0;
          text-align: initial;
          box-shadow: 0 0 10px var(--black);
          
          --title-font: var(--main-font);
          --title-font-size: 24px;
          --title-letter-spacing: 0.3em;
          --title-line-height: 1.8em;
          --title-margin: 0.5em;
          --title-text-align: justify;
          --title-indent: 0;
          --title-color: #FFFFFF;
          --subtitle-font: var(--main-font);
          --subtitle-font-size: 18px;
          --subtitle-letter-spacing: 0.1em;
          --subtitle-line-height: 1.8em;
          --subtitle-margin: 0.5em;
          --subtitle-text-align: justify;
          --subtitle-indent: 0;
          --subtitle-color: #FFFFFF;
          --text-font: var(--main-font);
          --text-font-size: 14px;
          --text-letter-spacing: 0;
          --text-line-height: 1.8em;
          --text-margin: 0.5em;
          --text-align: justify;
          --text-indent: 2em;
          --text-color: #FFFFFF;
          --ordered-list-font: var(--main-font);
          --ordered-list-font-size: 14px;
          --ordered-list-letter-spacing: 0;
          --ordered-list-line-height: 1.8em;
          --ordered-list-margin: 0.5em;
          --ordered-list-item-margin: 0;
          --ordered-list-indent: 2em;
          --ordered-list-color: #FFFFFF;
          --unordered-list-font: var(--main-font);
          --unordered-list-font-size: 14px;
          --unordered-list-letter-spacing: 0;
          --unordered-list-line-height: 1.8em;
          --unordered-list-margin: 0.5em;
          --unordered-list-item-margin: 0;
          --unordered-list-indent: 2em;
          --unordered-list-color: #FFFFFF;
          --image-margin: 0.5em;
          --image-border-radius: 0;
          --image-label-font: var(--main-font);
          --image-label-font-size: 12px;
          --image-label-letter-spacing: 0;
          --image-label-color: #C0C4CC;
          --blockquote-margin: 0.5em;
          --blockquote-border-color: #DCDFE6;
          
          blockquote {
            margin: 0;
            padding-left: 10px;
            margin-top: var(--blockquote-margin);
            margin-bottom: var(--blockquote-margin);
            border-left-color: var(--blockquote-border-color);
            border-left-style: solid;
            border-left-width: 3px;
            box-sizing: border-box;
          }
          
          h2 {
            font-family: var(--title-font);
            font-size: var(--title-font-size);
            letter-spacing: var(--title-letter-spacing);
            margin-top: var(--title-margin);
            margin-bottom: var(--title-margin);
            line-height: var(--title-line-height);
            text-align: var(--title-text-align);
            text-indent: var(--title-indent);
            color: var(--title-color);
          }
          
          h3 {
            font-family: var(--subtitle-font);
            font-size: var(--subtitle-font-size);
            letter-spacing: var(--subtitle-letter-spacing);
            margin-top: var(--subtitle-margin);
            margin-bottom: var(--subtitle-margin);
            line-height: var(--subtitle-line-height);
            text-align: var(--subtitle-text-align);
            text-indent: var(--subtitle-indent);
            color: var(--subtitle-color);
          }
          
          p {
            font-family: var(--text-font);
            font-size: var(--text-font-size);
            letter-spacing: var(--text-letter-spacing);
            margin-top: var(--text-margin);
            margin-bottom: var(--text-margin);
            line-height: var(--text-line-height);
            text-align: var(--text-align);
            text-indent: var(--text-indent);
            color: var(--text-color);
          }
          
          ul {
            font-family: var(--unordered-list-font);
            font-size: var(--unordered-list-font-size);
            letter-spacing: var(--unordered-list-letter-spacing);
            margin-top: var(--unordered-list-margin);
            margin-bottom: var(--unordered-list-margin);
            line-height: var(--unordered-list-line-height);
            padding-left: var(--unordered-list-indent);
            color: var(--unordered-list-color);
            
            li {
              margin-top: var(--unordered-list-item-margin);
              margin-bottom: var(--unordered-item-list-margin);
            }
          }
          
          ol {
            font-family: var(--ordered-list-font);
            font-size: var(--ordered-list-font-size);
            letter-spacing: var(--ordered-list-letter-spacing);
            margin-top: var(--ordered-list-margin);
            margin-bottom: var(--ordered-list-margin);
            line-height: var(--ordered-list-line-height);
            padding-left: var(--ordered-list-indent);
            color: var(--ordered-list-color);
            
            li {
              margin-top: var(--ordered-list-item-margin);
              margin-bottom: var(--ordered-item-list-margin);
            }
          }
          
          figure {
            margin: 0;
            width: 100%;
            
            img {
              display: block;
              width: 100%;
              border-radius: var(--image-border-radius);
              font-size: 12px;
              margin-top: var(--image-margin);
              margin-bottom: var(--image-margin);
            }
            
            canvas {
              display: block;
              width: 100%;
              border-radius: var(--image-border-radius);
              font-size: 12px;
              margin-top: var(--image-margin);
              margin-bottom: var(--image-margin);
            }
            
            figcaption {
              font-family: var(--image-label-font);
              font-size: var(--image-label-font-size);
              letter-spacing: var(--image-label-letter-spacing);
              text-align: center;
              color: var(--image-label-color);
            }
          }
        }
        
        &::-webkit-scrollbar {
          width: 10px;
        }
            
        &::-webkit-scrollbar-track {
          border-radius: 5px;
          background-color: var(--white-gray);
          
          &:hover {
            background-color: var(--light-gray);
          }
        }
        
        &::-webkit-scrollbar-thumb {
          border-radius: 5px;
          background-color: var(--gray);
          transition: 0.2s;
          
          &:hover {
            background-color: var(--dark-gray);
          }
        }
      }
    }
  }

  #right {
    width: 300px;
    height: 100%;
    display: flex;
    flex-direction: column;

    #tabs {
      height: 0;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow-y: auto;

      #config {
        width: 100%;
        height: 100%;
        margin-top: -10px;
        margin-bottom: -10px;
        padding-top: 10px;
        padding-bottom: 10px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        #image-container {
          display: flex;
          justify-content: space-between;
          width: 100%;
          height: 120px;

          #upload-container {
            width: 100%;
            height: 100%;
            transition: 0.5s;
            display: flex;
            flex-direction: column;
            
            &.half {
              width: calc(50% - 5px);
            }

            #upload-dragger {
              width: 100%;
              height: 0;
              flex-grow: 1;
              
              .el-upload {
                width: 100%;
                height: 100%;
                
                .el-upload-dragger {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  color: var(--dark-gray);
                  border-color: var(--light-gray);
                  transition: 0.2s;
                  
                  svg {
                    font-size: 40px;
                    margin: 14px;
                  }
                  
                  &:hover {
                    color: var(--main-color);
                    border-color: var(--main-color);
                    
                    .el-upload__text {
                      color: var(--main-color);
                    }
                  }
                }
              }
            }
          }

          #image-preview-container {
            width: calc(50% - 5px);
            height: 100%;
            background-color: var(--black-gray);
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;

            #image-preview {
              max-width: 100%;
              max-height: 100%;
            }
          }
        }

        #name {
          margin-top: 10px;
        }

        .el-collapse-item__header {
          height: 30px;
          font-size: 14px;
        }
        
        .el-collapse-item__content {
          padding-top: 10px;
          padding-bottom: 10px;
        }
        
        .el-textarea__inner {
          font-family: var(--main-font);
          
          &::-webkit-scrollbar {
            width: 10px;
          }
              
          &::-webkit-scrollbar-track {
            border-radius: 5px;
            background-color: var(--transparent);
            
            &:hover {
              background-color: var(--white-gray);
            }
          }
          
          &::-webkit-scrollbar-thumb {
            border-radius: 5px;
            background-color: var(--light-gray);
            transition: 0.2s;
            
            &:hover {
              background-color: var(--gray);
            }
          }
        }

        .el-slider__runway {
          margin-left: 8px;

          .el-slider__button {
            width: 8px;
            height: 8px;
          }
        }

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .el-tabs__header {
        margin: 0;
        
        .el-tabs__nav-scroll {
          background-color: var(--main-color);
          
          .el-tabs__nav {
            border: 0;
            
            .el-tabs__item {
              width: 100px;
              height: 50px;
              line-height: 50px;
              text-align: center;
              border: 0;
              transition: 0.2s;
              
              &.is-active {
                background-color: var(--white);
                color: var(--main-color);
                cursor: default;
              }
              
              &:not(.is-active) {
                color: var(--white);
                position: relative;
              }
              
              &:not(.is-active)::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                transition: 0.2s;
              }

              &:not(.is-active):hover::after {
                background-color: rgba(0, 0, 0, 0.1);
              }
            }
          }
        }
      }
      
      .el-tabs__content {
        flex-grow: 1;
        
        .el-tab-pane {
          width: 100%;
          height: 100%;
          padding: 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 0;
            width: 100%;
            height: 10px;
            background-image: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
            z-index: 2000;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 10px;
            left: 0;
            width: 100%;
            height: 10px;
            background-image: linear-gradient(0deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
            z-index: 2000;
          }
        }
      }

      &::-webkit-scrollbar {
        display: none;
      }
    }

    #actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      padding-left: 20px;
      padding-right: 20px;
      box-sizing: border-box;
    }
  }
}
</style>

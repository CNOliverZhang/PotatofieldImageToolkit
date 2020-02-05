<template>
  <div id="text-to-image-editor">
    <div
      id="preview-container"
      class="interactable"
      :style="{
        'background-color': backgroundColor
      }">
      <div
        id="preview"
        v-html="content"
        :style="{
          'padding': padding + 'px',
          'background-color': backgroundColor
        }">
      </div>
    </div>
    <div id="template-list">
      <div class="row">
        <div class="subtitle">已保存的模板</div>
      </div>
      <div v-if="this.$store.state.textToImage.templates.length != 0" id="list" class="interactable">
        <div
          v-for="(template, index) in this.$store.state.textToImage.templates"
          :key="template.title"
          class="template">
          <div class="cover">
            <div class="action interactable" @click="applyTemplate(index)">
              <span class="fa fa-check-circle"></span>
              <div>应用</div>
            </div>
            <div class="action interactable" @click="deleteTemplate(index)">
              <span class="fa fa-trash-alt"></span>
              <div>删除</div>
            </div>
          </div>
          <div class="text">{{ template.title }}</div>
          <div class="subtext">外框宽度：{{ template.padding != 0 ? template.padding : '无外框' }}</div>
          <div class="subtext">背景颜色：
            <div
              class="color-sample"
              :style="{
                'background-color': template.backgroundColor
              }"></div>
          </div>
        </div>
      </div>
      <div v-else id="empty-container">
        <div id="empty">
          <i class="far fa-folder-open"></i>
          <div>尚无已保存的模板</div>
        </div>
      </div>
    </div>
    <div id="control" class="interactable">
      <div>
        <div class="row">
          <div class="subtitle">样式设置</div>
        </div>
        <el-collapse value="basic" accordion>
          <el-collapse-item title="基本样式" name="basic">
            <div class="control-row">
              <div class="text">外边距</div>
              <el-slider
                v-model="padding"
                class="control"
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
              <el-select v-model="titleFont" placeholder="请选择" size="mini">
                <el-option-group label="中英文字体">
                  <el-option label="思源黑体(细)" value="NotoSansSCThin" style="font-family: NotoSansSCThin;"/>
                  <el-option label="思源黑体(粗)" value="NotoSansSCBlack" style="font-family: NotoSansSCBlack;"/>
                  <el-option label="思源宋体(细)" value="NotoSerifSCThin" style="font-family: NotoSerifSCThin;"/>
                  <el-option label="思源宋体(粗)" value="NotoSerifSCBlack" style="font-family: NotoSerifSCBlack;"/>
                  <el-option label="站酷庆科黄油体" value="ZCoolHuangyou" style="font-family: ZCoolHuangyou;"/>
                  <el-option label="站酷小薇LOGO体" value="ZCoolXiaowei" style="font-family: ZCoolXiaowei;"/>
                  <el-option label="站酷快乐体" value="ZCoolKuaile" style="font-family: ZCoolKuaile;"/>
                  <el-option label="站酷文艺体" value="ZCoolWenyi" style="font-family: ZCoolWenyi;"/>
                  <el-option label="站酷酷黑体" value="ZCoolKuhei" style="font-family: ZCoolKuhei;"/>
                  <el-option label="站酷高端黑体" value="ZCoolGaoduanhei" style="font-family: ZCoolGaoduanhei;"/>
                </el-option-group>
                <el-option-group label="纯英文字体">
                  <el-option label="ZCOOL Addict Italic" value="ZCoolAddict" style="font-family: ZCoolAddict;"></el-option>
                </el-option-group>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">字体大小</div>
              <el-slider
                v-model="titleFontSize"
                class="control"
                :min="15"
                :max="100"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">字间距</div>
              <el-slider
                v-model="titleLetterSpacing"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">行距</div>
              <el-slider
                v-model="titleLineHeight"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">段间距</div>
              <el-slider
                v-model="titleMargin"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">对齐方式</div>
              <el-select v-model="titleTextAlign" placeholder="请选择" size="mini">
                <el-option label="左对齐" value="justify"/>
                <el-option label="居中对齐" value="center"/>
                <el-option label="右对齐" value="right"/>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">缩进设置</div>
              <el-switch
                v-model="titleIndent"
                active-text="缩进"
                inactive-text="不缩进"
                class="control"></el-switch>
            </div>
            <div class="control-row">
              <div class="text">字体颜色</div>
              <el-color-picker v-model="titleColor" size="mini" :show-alpha="true"></el-color-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="二级标题样式" name="subtitle">
            <div class="control-row">
              <div class="text">字体</div>
              <el-select v-model="subtitleFont" placeholder="请选择" size="mini">
                <el-option-group label="中英文字体">
                  <el-option label="思源黑体(细)" value="NotoSansSCThin" style="font-family: NotoSansSCThin;"/>
                  <el-option label="思源黑体(粗)" value="NotoSansSCBlack" style="font-family: NotoSansSCBlack;"/>
                  <el-option label="思源宋体(细)" value="NotoSerifSCThin" style="font-family: NotoSerifSCThin;"/>
                  <el-option label="思源宋体(粗)" value="NotoSerifSCBlack" style="font-family: NotoSerifSCBlack;"/>
                  <el-option label="站酷庆科黄油体" value="ZCoolHuangyou" style="font-family: ZCoolHuangyou;"/>
                  <el-option label="站酷小薇LOGO体" value="ZCoolXiaowei" style="font-family: ZCoolXiaowei;"/>
                  <el-option label="站酷快乐体" value="ZCoolKuaile" style="font-family: ZCoolKuaile;"/>
                  <el-option label="站酷文艺体" value="ZCoolWenyi" style="font-family: ZCoolWenyi;"/>
                  <el-option label="站酷酷黑体" value="ZCoolKuhei" style="font-family: ZCoolKuhei;"/>
                  <el-option label="站酷高端黑体" value="ZCoolGaoduanhei" style="font-family: ZCoolGaoduanhei;"/>
                </el-option-group>
                <el-option-group label="纯英文字体">
                  <el-option label="ZCOOL Addict Italic" value="ZCoolAddict" style="font-family: ZCoolAddict;"></el-option>
                </el-option-group>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">字体大小</div>
              <el-slider
                v-model="subtitleFontSize"
                class="control"
                :min="10"
                :max="80"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">字间距</div>
              <el-slider
                v-model="subtitleLetterSpacing"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">行距</div>
              <el-slider
                v-model="subtitleLineHeight"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">段间距</div>
              <el-slider
                v-model="subtitleMargin"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">对齐方式</div>
              <el-select v-model="subtitleTextAlign" placeholder="请选择" size="mini">
                <el-option label="左对齐" value="justify"/>
                <el-option label="居中对齐" value="center"/>
                <el-option label="右对齐" value="right"/>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">缩进设置</div>
              <el-switch
                v-model="subtitleIndent"
                active-text="缩进"
                inactive-text="不缩进"
                class="control"></el-switch>
            </div>
            <div class="control-row">
              <div class="text">字体颜色</div>
              <el-color-picker v-model="subtitleColor" size="mini" :show-alpha="true"></el-color-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="文本样式" name="text">
            <div class="control-row">
              <div class="text">字体</div>
              <el-select v-model="textFont" placeholder="请选择" size="mini">
                <el-option-group label="中英文字体">
                  <el-option label="思源黑体(细)" value="NotoSansSCThin" style="font-family: NotoSansSCThin;"/>
                  <el-option label="思源黑体(粗)" value="NotoSansSCBlack" style="font-family: NotoSansSCBlack;"/>
                  <el-option label="思源宋体(细)" value="NotoSerifSCThin" style="font-family: NotoSerifSCThin;"/>
                  <el-option label="思源宋体(粗)" value="NotoSerifSCBlack" style="font-family: NotoSerifSCBlack;"/>
                  <el-option label="站酷庆科黄油体" value="ZCoolHuangyou" style="font-family: ZCoolHuangyou;"/>
                  <el-option label="站酷小薇LOGO体" value="ZCoolXiaowei" style="font-family: ZCoolXiaowei;"/>
                  <el-option label="站酷快乐体" value="ZCoolKuaile" style="font-family: ZCoolKuaile;"/>
                  <el-option label="站酷文艺体" value="ZCoolWenyi" style="font-family: ZCoolWenyi;"/>
                  <el-option label="站酷酷黑体" value="ZCoolKuhei" style="font-family: ZCoolKuhei;"/>
                  <el-option label="站酷高端黑体" value="ZCoolGaoduanhei" style="font-family: ZCoolGaoduanhei;"/>
                </el-option-group>
                <el-option-group label="纯英文字体">
                  <el-option label="ZCOOL Addict Italic" value="ZCoolAddict" style="font-family: ZCoolAddict;"></el-option>
                </el-option-group>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">字体大小</div>
              <el-slider
                v-model="textFontSize"
                class="control"
                :min="5"
                :max="60"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">字间距</div>
              <el-slider
                v-model="textLetterSpacing"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">行距</div>
              <el-slider
                v-model="textLineHeight"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">段间距</div>
              <el-slider
                v-model="textMargin"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">对齐方式</div>
              <el-select v-model="textAlign" placeholder="请选择" size="mini">
                <el-option label="左对齐" value="justify"/>
                <el-option label="居中对齐" value="center"/>
                <el-option label="右对齐" value="right"/>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">段首缩进设置</div>
              <el-switch
                v-model="textIndent"
                active-text="缩进"
                inactive-text="不缩进"
                class="control"></el-switch>
            </div>
            <div class="control-row">
              <div class="text">字体颜色</div>
              <el-color-picker v-model="textColor" size="mini" :show-alpha="true"></el-color-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="有序列表样式" name="orderedList">
            <div class="control-row">
              <div class="text">字体</div>
              <el-select v-model="orderedListFont" placeholder="请选择" size="mini">
                <el-option-group label="中英文字体">
                  <el-option label="思源黑体(细)" value="NotoSansSCThin" style="font-family: NotoSansSCThin;"/>
                  <el-option label="思源黑体(粗)" value="NotoSansSCBlack" style="font-family: NotoSansSCBlack;"/>
                  <el-option label="思源宋体(细)" value="NotoSerifSCThin" style="font-family: NotoSerifSCThin;"/>
                  <el-option label="思源宋体(粗)" value="NotoSerifSCBlack" style="font-family: NotoSerifSCBlack;"/>
                  <el-option label="站酷庆科黄油体" value="ZCoolHuangyou" style="font-family: ZCoolHuangyou;"/>
                  <el-option label="站酷小薇LOGO体" value="ZCoolXiaowei" style="font-family: ZCoolXiaowei;"/>
                  <el-option label="站酷快乐体" value="ZCoolKuaile" style="font-family: ZCoolKuaile;"/>
                  <el-option label="站酷文艺体" value="ZCoolWenyi" style="font-family: ZCoolWenyi;"/>
                  <el-option label="站酷酷黑体" value="ZCoolKuhei" style="font-family: ZCoolKuhei;"/>
                  <el-option label="站酷高端黑体" value="ZCoolGaoduanhei" style="font-family: ZCoolGaoduanhei;"/>
                </el-option-group>
                <el-option-group label="纯英文字体">
                  <el-option label="ZCOOL Addict Italic" value="ZCoolAddict" style="font-family: ZCoolAddict;"></el-option>
                </el-option-group>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">字体大小</div>
              <el-slider
                v-model="orderedListFontSize"
                class="control"
                :min="5"
                :max="60"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">字间距</div>
              <el-slider
                v-model="orderedListLetterSpacing"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">行距</div>
              <el-slider
                v-model="orderedListLineHeight"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">项目间距</div>
              <el-slider
                v-model="orderedListItemMargin"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">段间距</div>
              <el-slider
                v-model="orderedListMargin"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">缩进设置</div>
              <el-slider
                v-model="orderedListIndent"
                class="control"
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
              <el-select v-model="orderedListFont" placeholder="请选择" size="mini">
                <el-option-group label="中英文字体">
                  <el-option label="思源黑体(细)" value="NotoSansSCThin" style="font-family: NotoSansSCThin;"/>
                  <el-option label="思源黑体(粗)" value="NotoSansSCBlack" style="font-family: NotoSansSCBlack;"/>
                  <el-option label="思源宋体(细)" value="NotoSerifSCThin" style="font-family: NotoSerifSCThin;"/>
                  <el-option label="思源宋体(粗)" value="NotoSerifSCBlack" style="font-family: NotoSerifSCBlack;"/>
                  <el-option label="站酷庆科黄油体" value="ZCoolHuangyou" style="font-family: ZCoolHuangyou;"/>
                  <el-option label="站酷小薇LOGO体" value="ZCoolXiaowei" style="font-family: ZCoolXiaowei;"/>
                  <el-option label="站酷快乐体" value="ZCoolKuaile" style="font-family: ZCoolKuaile;"/>
                  <el-option label="站酷文艺体" value="ZCoolWenyi" style="font-family: ZCoolWenyi;"/>
                  <el-option label="站酷酷黑体" value="ZCoolKuhei" style="font-family: ZCoolKuhei;"/>
                  <el-option label="站酷高端黑体" value="ZCoolGaoduanhei" style="font-family: ZCoolGaoduanhei;"/>
                </el-option-group>
                <el-option-group label="纯英文字体">
                  <el-option label="ZCOOL Addict Italic" value="ZCoolAddict" style="font-family: ZCoolAddict;"></el-option>
                </el-option-group>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">字体大小</div>
              <el-slider
                v-model="unorderedListFontSize"
                class="control"
                :min="5"
                :max="60"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">字间距</div>
              <el-slider
                v-model="unorderedListLetterSpacing"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">行距</div>
              <el-slider
                v-model="unorderedListLineHeight"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">项目间距</div>
              <el-slider
                v-model="unorderedListItemMargin"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">段间距</div>
              <el-slider
                v-model="unorderedListMargin"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">缩进设置</div>
              <el-slider
                v-model="unorderedListIndent"
                class="control"
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
              <el-slider
                v-model="imageBorderRadius"
                class="control"
                :min="0"
                :max="30"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">图片段间距</div>
              <el-slider
                v-model="imageMargin"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">注释字体</div>
              <el-select v-model="imageLableFont" placeholder="请选择" size="mini">
                <el-option-group label="中英文字体">
                  <el-option label="思源黑体(细)" value="NotoSansSCThin" style="font-family: NotoSansSCThin;"/>
                  <el-option label="思源黑体(粗)" value="NotoSansSCBlack" style="font-family: NotoSansSCBlack;"/>
                  <el-option label="思源宋体(细)" value="NotoSerifSCThin" style="font-family: NotoSerifSCThin;"/>
                  <el-option label="思源宋体(粗)" value="NotoSerifSCBlack" style="font-family: NotoSerifSCBlack;"/>
                  <el-option label="站酷庆科黄油体" value="ZCoolHuangyou" style="font-family: ZCoolHuangyou;"/>
                  <el-option label="站酷小薇LOGO体" value="ZCoolXiaowei" style="font-family: ZCoolXiaowei;"/>
                  <el-option label="站酷快乐体" value="ZCoolKuaile" style="font-family: ZCoolKuaile;"/>
                  <el-option label="站酷文艺体" value="ZCoolWenyi" style="font-family: ZCoolWenyi;"/>
                  <el-option label="站酷酷黑体" value="ZCoolKuhei" style="font-family: ZCoolKuhei;"/>
                  <el-option label="站酷高端黑体" value="ZCoolGaoduanhei" style="font-family: ZCoolGaoduanhei;"/>
                </el-option-group>
                <el-option-group label="纯英文字体">
                  <el-option label="ZCOOL Addict Italic" value="ZCoolAddict" style="font-family: ZCoolAddict;"></el-option>
                </el-option-group>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">注释字体大小</div>
              <el-slider
                v-model="imageLableFontSize"
                class="control"
                :min="3"
                :max="40"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">注释字间距</div>
              <el-slider
                v-model="imageLableLetterSpacing"
                class="control"
                :min="0"
                :max="3"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">注释字体颜色</div>
              <el-color-picker v-model="imageLableColor" size="mini" :show-alpha="true"></el-color-picker>
            </div>
            <div class="control-row">
              <div class="text">引用段间距</div>
              <el-slider
                v-model="blockquoteMargin"
                class="control"
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
        <div class="row">
          <div class="subtitle">保存设置</div>
        </div>
        <div class="control-row">
          <div class="text">存储位置</div>
          <el-input disabled size="mini" v-model="distDirectory" class="control">
            <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
        <div class="control-row">
          <div class="text">文件名</div>
          <el-input size="mini" v-model="filename" class="control" placeholder="请输入文件名">
            <template slot="append">.jpg</template>
          </el-input>
        </div>
      </div>
      <div class="row">
        <el-button type="primary" size="mini" @click="close" class="control-button">退出编辑器</el-button>
        <el-button type="primary" size="mini" @click="saveAsTemplate" class="control-button">保存为模板</el-button>
        <el-button type="primary" size="mini" @click="start" class="control-button">开始拼接</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
const path = require('path')
const fs = require('fs')

export default {
  name: 'textToImageEditor',
  data () {
    return  {
      content: this.$store.state.textToImage.content,
      padding: 20,
      backgroundColor: '#303133',
      titleFont: 'NotoSerifSCBlack',
      titleFontSize: 24,
      titleLetterSpacing: 0.3,
      titleLineHeight: 1.8,
      titleMargin: 0.5,
      titleTextAlign: 'justify',
      titleIndent: false,
      titleColor: '#FFFFFF',
      subtitleFont: 'NotoSerifSCBlack',
      subtitleFontSize: 18,
      subtitleLetterSpacing: 0.1,
      subtitleLineHeight: 1.8,
      subtitleMargin: 0.5,
      subtitleTextAlign: 'justify',
      subtitleIndent: false,
      subtitleColor: '#FFFFFF',
      textFont: 'NotoSansSCThin',
      textFontSize: 14,
      textLetterSpacing: 0,
      textLineHeight: 1.8,
      textMargin: 0.5,
      textAlign: 'justify',
      textIndent: true,
      textColor: '#FFFFFF',
      orderedListFont: 'NotoSansSCThin',
      orderedListFontSize: 14,
      orderedListLetterSpacing: 0,
      orderedListLineHeight: 1.8,
      orderedListMargin: 0.5,
      orderedListItemMargin: 0,
      orderedListIndent: 2,
      orderedListColor: '#FFFFFF',
      unorderedListFont: 'NotoSansSCThin',
      unorderedListFontSize: 14,
      unorderedListLetterSpacing: 0,
      unorderedListLineHeight: 1.8,
      unorderedListMargin: 0.5,
      unorderedListItemMargin: 0,
      unorderedListIndent: 2,
      unorderedListColor: '#FFFFFF',
      imageBorderRadius: 0,
      imageMargin: 0.5,
      imageLableFont: 'NotoSansSCThin',
      imageLableFontSize: 12,
      imageLableLetterSpacing: 0,
      imageLableColor: '#C0C4CC',
      blockquoteMargin: 0.5,
      blockquoteBorderColor: '#DCDFE6',
      distDirectory: '',
      filename: '',
      templateTitle: ''
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
    imageLableFont: (value) => {
      document.getElementById('preview').style.setProperty('--image-lable-font', value)
    },
    imageLableFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--image-lable-font-size', String(value) + 'px')
    },
    imageLableLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--image-lable-letter-spacing', String(value) + 'em')
    },
    imageLableColor: (value) => {
      document.getElementById('preview').style.setProperty('--image-lable-color', value)
    },
    blockquoteMargin: (value) => {
      document.getElementById('preview').style.setProperty('--blockquote-margin', String(value) + 'em')
    },
    blockquoteBorderColor: (value) => {
      document.getElementById('preview').style.setProperty('--blockquote-border-color', value)
    }
  },
  methods: {
    close() {
      this.$store.dispatch('textToImage/contentReset')
      ipcRenderer.send('close')
      this.$destroy()
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    applyTemplate(index) {
      this.padding = this.$store.state.textToImage.templates[index].padding
      this.backgroundColor = this.$store.state.textToImage.templates[index].backgroundColor
      this.titleFont = this.$store.state.textToImage.templates[index].titleFont
      this.titleFontSize = this.$store.state.textToImage.templates[index].titleFontSize
      this.titleLetterSpacing = this.$store.state.textToImage.templates[index].titleLetterSpacing
      this.titleLineHeight = this.$store.state.textToImage.templates[index].titleLineHeight
      this.titleMargin = this.$store.state.textToImage.templates[index].titleMargin
      this.titleTextAlign = this.$store.state.textToImage.templates[index].titleTextAlign
      this.titleIndent = this.$store.state.textToImage.templates[index].titleIndent
      this.titleColor = this.$store.state.textToImage.templates[index].titleColor
      this.subtitleFont = this.$store.state.textToImage.templates[index].subtitleFont
      this.subtitleFontSize = this.$store.state.textToImage.templates[index].subtitleFontSize
      this.subtitleLetterSpacing = this.$store.state.textToImage.templates[index].subtitleLetterSpacing
      this.subtitleLineHeight = this.$store.state.textToImage.templates[index].subtitleLineHeight
      this.subtitleMargin = this.$store.state.textToImage.templates[index].subtitleMargin
      this.subtitleTextAlign = this.$store.state.textToImage.templates[index].subtitleTextAlign
      this.subtitleIndent = this.$store.state.textToImage.templates[index].subtitleIndent
      this.subtitleColor = this.$store.state.textToImage.templates[index].subtitleColor
      this.textFont = this.$store.state.textToImage.templates[index].textFont
      this.textFontSize = this.$store.state.textToImage.templates[index].textFontSize
      this.textLetterSpacing = this.$store.state.textToImage.templates[index].textLetterSpacing
      this.textLineHeight = this.$store.state.textToImage.templates[index].textLineHeight
      this.textMargin = this.$store.state.textToImage.templates[index].textMargin
      this.textAlign = this.$store.state.textToImage.templates[index].textAlign
      this.textIndent = this.$store.state.textToImage.templates[index].textIndent
      this.textColor = this.$store.state.textToImage.templates[index].textColor
      this.orderedListFont = this.$store.state.textToImage.templates[index].orderedListFont
      this.orderedListFontSize = this.$store.state.textToImage.templates[index].orderedListFontSize
      this.orderedListLetterSpacing = this.$store.state.textToImage.templates[index].orderedListLetterSpacing
      this.orderedListLineHeight = this.$store.state.textToImage.templates[index].orderedListLineHeight
      this.orderedListMargin = this.$store.state.textToImage.templates[index].orderedListMargin
      this.orderedListItemMargin = this.$store.state.textToImage.templates[index].orderedListItemMargin
      this.orderedListIndent = this.$store.state.textToImage.templates[index].orderedListIndent
      this.orderedListColor = this.$store.state.textToImage.templates[index].orderedListColor
      this.unorderedListFont = this.$store.state.textToImage.templates[index].unorderedListFont
      this.unorderedListFontSize = this.$store.state.textToImage.templates[index].unorderedListFontSize
      this.unorderedListLetterSpacing = this.$store.state.textToImage.templates[index].unorderedListLetterSpacing
      this.unorderedListLineHeight = this.$store.state.textToImage.templates[index].unorderedListLineHeight
      this.unorderedListMargin = this.$store.state.textToImage.templates[index].unorderedListMargin
      this.unorderedListItemMargin = this.$store.state.textToImage.templates[index].unorderedListItemMargin
      this.unorderedListIndent = this.$store.state.textToImage.templates[index].unorderedListIndent
      this.unorderedListColor = this.$store.state.textToImage.templates[index].unorderedListColor
      this.imageBorderRadius = this.$store.state.textToImage.templates[index].imageBorderRadius
      this.imageMargin = this.$store.state.textToImage.templates[index].imageMargin
      this.imageLableFont = this.$store.state.textToImage.templates[index].imageLableFont
      this.imageLableFontSize = this.$store.state.textToImage.templates[index].imageLableFontSize
      this.imageLableLetterSpacing = this.$store.state.textToImage.templates[index].imageLableLetterSpacing
      this.imageLableColor = this.$store.state.textToImage.templates[index].imageLableColor
      this.blockquoteMargin = this.$store.state.textToImage.templates[index].blockquoteMargin
      this.blockquoteBorderColor = this.$store.state.textToImage.templates[index].blockquoteBorderColor
    },
    deleteTemplate(index) {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: (index) => {
          this.$store.dispatch('textToImage/templateDelete', index)
        }
      })
    },
    saveAsTemplate() {
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
        imageLableFont: this.imageLableFont,
        imageLableFontSize: this.imageLableFontSize,
        imageLableLetterSpacing: this.imageLableLetterSpacing,
        imageLableColor: this.imageLableColor,
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
            text: '样式模板保存成功。'
          })
        }
      }
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
    },
    start() {
      if (this.distDirectory == '') {
        this.$dialog({
          type: 'warning',
          text: '请选择保存的目录！'
        })
      } else if (this.filename == '') {
        this.$dialog({
          type: 'warning',
          text: '请输入文件名！'
        })
      } else {
        let dialog = this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        })
        setTimeout(() => {
          let fullname = this.filename + '.jpg'
          let distFullpath = path.join(this.distDirectory, fullname)
          let previewContainer = document.getElementById('preview-container')
          previewContainer.style['overflow-y'] = 'hidden'
          let preview = document.getElementById('preview')
          let width = window.getComputedStyle(preview).getPropertyValue('width').slice(0, -2)
          let height = window.getComputedStyle(preview).getPropertyValue('height').slice(0, -2)
          let scale = Math.min((1500 / width), (16000 / height))
          let canvas = document.createElement('canvas')
          canvas.width = width * scale
          canvas.height = height * scale
          html2canvas(preview, {
            canvas: canvas,
            scale: scale,
            backgroundColor: null,
            allowTaint: true,
            imageTimeout: 0
          }).then(canvas => {
            let url = canvas.toDataURL('image/jpeg').replace(/^data:image\/\w+;base64,/, "")
            let buffer = new Buffer.from(url, 'base64')
            fs.writeFile(distFullpath, buffer, (error) => {
              if (error) {
                dialog.change({
                  type: 'error',
                  title: '出现错误',
                  text: '写入文件失败，请检查目标文件夹权限。',
                  showConfirm: true
                })
              } else {
                dialog.change({
                  type: 'success',
                  title: '成功',
                  text: '处理完成，制作完成的图片已保存到目标文件夹。',
                  showConfirm: true,
                  confirmFunction: () => {
                    this.close()
                  }
                })
              }
            })
          })
        }, 0)
      }
    }
  }
}
</script>

<style lang="scss">  
.el-color-picker__panel {
  -webkit-app-region: no-drag;
  
  button {
    font-family: var(--main-font);
  }
}

#text-to-image-editor {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  button {
    font-family: var(--main-font);
  }
  
  input {
    font-family: var(--main-font);
  }
  
  .control-row {
    width: 100%;
    height: 21px;
    flex-shrink: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
    .el-switch {
      display: flex;
      justify-content: flex-end;
    }
    
    .el-radio-group {
      display: flex;
      justify-content: flex-end;
    }
    
    .control {
      width: 70%;
    }
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .row {
    width: 100%;
    flex-shrink: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
    
  #preview-container {
    width: 35%;
    height: 100%;
    border-color: var(--light-gray);
    border-style: solid;
    border-width: 1px;
    border-radius: 6px;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    
    #preview {
      width: 100%;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      color: var(--white);
      margin-bottom: 0;
      margin-top: 0;
      
      --title-font: 'NotoSerifSCBlack';
      --title-font-size: 24px;
      --title-letter-spacing: 0.3em;
      --title-line-height: 1.8em;
      --title-margin: 0.5em;
      --title-text-align: justify;
      --title-indent: 0;
      --title-color: #FFFFFF;
      --subtitle-font: 'NotoSerifSCBlack';
      --subtitle-font-size: 18px;
      --subtitle-letter-spacing: 0.1em;
      --subtitle-line-height: 1.8em;
      --subtitle-margin: 0.5em;
      --subtitle-text-align: justify;
      --subtitle-indent: 0;
      --subtitle-color: #FFFFFF;
      --text-font: 'NotoSansSCThin';
      --text-font-size: 14px;
      --text-letter-spacing: 0;
      --text-line-height: 1.8em;
      --text-margin: 0.5em;
      --text-align: justify;
      --text-indent: 2em;
      --text-color: #FFFFFF;
      --ordered-list-font: 'NotoSansSCThin';
      --ordered-list-font-size: 14px;
      --ordered-list-letter-spacing: 0;
      --ordered-list-line-height: 1.8em;
      --ordered-list-margin: 0.5em;
      --ordered-list-item-margin: 0;
      --ordered-list-indent: 2em;
      --ordered-list-color: #FFFFFF;
      --unordered-list-font: 'NotoSansSCThin';
      --unordered-list-font-size: 14px;
      --unordered-list-letter-spacing: 0;
      --unordered-list-line-height: 1.8em;
      --unordered-list-margin: 0.5em;
      --unordered-list-item-margin: 0;
      --unordered-list-indent: 2em;
      --unordered-list-color: #FFFFFF;
      --image-margin: 0.5em;
      --image-border-radius: 0;
      --image-lable-font: 'NotoSansSCThin';
      --image-lable-font-size: 12px;
      --image-lable-letter-spacing: 0;
      --image-lable-color: #C0C4CC;
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
          font-family: var(--image-lable-font);
          font-size: var(--image-lable-font-size);
          letter-spacing: var(--image-lable-letter-spacing);
          text-align: center;
          color: var(--image-lable-color);
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
  
  #template-list {
    flex-grow: 1;
    height: 100%;
    margin-left: 20px;
    margin-right: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    #list {
      width: 100%;
      flex-grow: 1;
      background-color: var(--white-gray);
      box-sizing: border-box;
      border-radius: 6px;
      border-color: var(--light-gray);
      border-style: solid;
      border-width: 1px;
      overflow-y: auto;
      overflow-x: hidden;
      
      .template {
        position: relative;
        height: 80px;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        background-color: var(--white);
        border-bottom-color: var(--light-gray);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        
        .text {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        
        .subtext {
          display: flex;
          align-items: center;
          
          .color-sample {
            width: 1em;
            height: 1em;
            border-color: var(--light-gray);
            border-style: solid;
            border-radius: 3px;
            border-width: 1px;
            box-sizing: border-box;
          }
        }
        
        .cover {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: var(--white);
          opacity: 0;
          transition: 0.2s;
          
          .action {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-size: 12px;
            width: 32px;
            margin-left: 10px;
            margin-right: 10px;
            transition: 0.2s;
            
            svg {
              font-size: 20px;
              margin: 5px;
            }
            
            &:hover {
              color: var(--main-color);
            }
            
            &:active {
              filter: brightness(0.9);
            }
          }
          
          &:hover {
            opacity: 1;
          }
        }
      }
      
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
    
    #empty-container {
      width: 100%;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--white-gray);
      box-sizing: border-box;
      border-radius: 6px;
      border-color: var(--light-gray);
      border-style: solid;
      border-width: 1px;
      
      #empty {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        
        svg {
          font-size: 40px;
          margin: 14px;
        }
      }
    }
  }
  
  #control {
    width: 40%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .control-button {
      width: 100%;
      margin-left: 5px;
      margin-right: 5px;
      
      &:first-child {
        margin-left: 0;
      }
      
      &:last-child {
        margin-right: 0;
      }
    }
    
    .el-collapse-item__header {
      height: 30px;
      font-size: 14px;
    }
    
    .el-collapse-item__content {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
}
</style>

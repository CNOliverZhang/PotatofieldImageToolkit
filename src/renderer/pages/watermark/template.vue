<template>
  <div id="watermark-template">
    <div id="preview">
      <div
        id="sample"
        :style="{
          'background-color': background
        }">
        <div
          id="watermark-container"
          :style="{
            'width': sampleWidth + 'px',
            'height': sampleHeight + 'px'
          }">
          <div
            id="watermark"
            :style="{
              'left': (position == 'left-top' || position == 'left-bottom' || position == 'left' || position == 'center' || position == 'top' || position == 'bottom') ? x + 'px' : null,
              'right': (position == 'right-top' || position == 'right-bottom' || position == 'right') ? x + 'px' : null,
              'top': (position == 'left-top' || position == 'right-top' || position == 'top' || position == 'center' || position == 'left' || position == 'right') ? y + 'px' : null,
              'bottom': (position == 'left-bottom' || position == 'right-bottom' || position == 'bottom') ? y + 'px' : null,
              'color': color,
              'font-family': font,
              'font-size': fontSize + 'px',
              'transform': 'rotate(' + rotation + 'deg)',
              'writing-mode': writingMode,
              'text-align': textAlign,
              'padding': backgroundSize / 100 + 'em',
              'background-color': backgroundColor,
              'text-shadow': textShadow
            }">
            <div
              v-for="(line, index) in text.split('\n')"
              :key="index"
              :style="{
                'margin-top': index == 0 ? 0 : String(lineHeight - 1) + 'em'
              }">
              <span
                v-for="(char, index) in line"
                :key="index"
                :style="{
                  'margin-left': index == 0 ? 0 : letterSpacing / 5 + 'em'
                }">{{ char }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row interactable">
        <div class="text">参照背景颜色</div>
        <el-select v-model="background" placeholder="请选择" size="mini">
          <el-option label="深色" value="var(--black-gray)"/>
          <el-option label="浅色" value="var(--white-gray)"/>
        </el-select>
      </div>
    </div>
    <div id="control" class="interactable">
      <div>
        <el-collapse value="content" accordion>
          <el-collapse-item title="水印内容" name="content">
            <el-input
              :rows="5"
              v-model="text"
              type="textarea"
              resize="none"
              placeholder="请输入水印内容"></el-input>
          </el-collapse-item>
          <el-collapse-item title="水印文字样式" name="style">
            <div class="control-row">
              <div class="text">水印字体</div>
              <el-select v-model="font" placeholder="请选择" size="mini">
                <el-option
                  v-for="(font, index) in this.$store.state.fonts.fontList"
                  :key="index"
                  :label="font.verbose + '（' + font.weight + '）'"
                  :value="font.fontFamily"
                  :style="{
                    'font-family': font.fontFamily
                  }"/>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">水印字体大小</div>
              <el-slider
                v-model="relativeFontSize"
                class="control"
                :min="1"
                :max="100"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印字体颜色</div>
              <el-color-picker v-model="color" size="mini" :show-alpha="true"></el-color-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="水印背景" name="background">
            <div class="control-row">
              <div class="text">水印背景尺寸</div>
              <el-slider
                v-model="backgroundSize"
                class="control"
                :min="0"
                :max="300"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印背景颜色</div>
              <el-color-picker v-model="backgroundColor" size="mini" :show-alpha="true"></el-color-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="水印阴影" name="shadow">
            <div class="control-row">
              <div class="text">水印阴影水平位置</div>
              <el-slider
                v-model="textShadowX"
                class="control"
                :min="-1"
                :max="1"
                :step="0.01"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印阴影垂直位置</div>
              <el-slider
                v-model="textShadowY"
                class="control"
                :min="-1"
                :max="1"
                :step="0.01"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印阴影模糊</div>
              <el-slider
                v-model="textShadowBlur"
                class="control"
                :min="0"
                :max="1"
                :step="0.01"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印阴影颜色</div>
              <el-color-picker v-model="textShadowColor" size="mini" :show-alpha="true"></el-color-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="水印文字位置" name="position">
            <div class="control-row">
              <div class="text">水印位置基准</div>
              <el-select v-model="position" @change="changePosition" placeholder="请选择" size="mini">
                <el-option label="中央" value="center"/>
                <el-option label="左上角" value="left-top"/>
                <el-option label="右上角" value="right-top"/>
                <el-option label="左下角" value="left-bottom"/>
                <el-option label="右下角" value="right-bottom"/>
                <el-option label="上方" value="top"/>
                <el-option label="下方" value="bottom"/>
                <el-option label="左侧" value="left"/>
                <el-option label="右侧" value="right"/>
              </el-select>
            </div>
            <div
              v-if="position == 'left-top' || position == 'left-bottom' || position == 'left' || position == 'right-top' || position == 'right-bottom' || position == 'right'"
              class="control-row">
              <div v-if="position == 'left-top' || position == 'left-bottom' || position == 'left'" class="text">水印与左边缘的距离</div>
              <div v-if="position == 'right-top' || position == 'right-bottom' || position == 'right'" class="text">水印与右边缘的距离</div>
              <el-slider
                v-model="offsetX"
                class="control"
                :min="0"
                :max="100"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div
              v-if="position == 'left-top' || position == 'left-bottom' || position == 'top' || position == 'right-top' || position == 'right-bottom' || position == 'bottom'"
              class="control-row">
              <div v-if="position == 'left-top' || position == 'right-top' || position == 'top'" class="text">水印与上边缘的距离</div>
              <div v-if="position == 'left-bottom' || position == 'right-bottom' || position == 'bottom'" class="text">水印与下边缘的距离</div>
              <el-slider
                v-model="offsetY"
                class="control"
                :min="0"
                :max="100"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印旋转角度</div>
              <el-slider
                v-model="rotation"
                class="control"
                :min="-180"
                :max="180"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
          </el-collapse-item>
          <el-collapse-item title="水印文字排版" name="typesetting">
            <div class="control-row">
              <div class="text">水印文字方向</div>
              <el-select v-model="writingMode" placeholder="请选择" size="mini">
                <el-option label="水平" value="horizontal-tb"/>
                <el-option label="垂直从右至左" value="vertical-rl"/>
                <el-option label="垂直从左至右" value="vertical-lr"/>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">多行水印对齐方式</div>
              <el-select v-model="textAlign" placeholder="请选择" size="mini">
                <el-option label="居中对齐" value="center"/>
                <el-option label="行首对齐" value="left"/>
                <el-option label="行尾对其" value="right"/>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">多行水印行距</div>
              <el-slider
                v-model="lineHeight"
                class="control"
                :min="1"
                :max="10"
                :step="0.1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印文字间距</div>
              <el-slider
                v-model="letterSpacing"
                class="control"
                :min="0"
                :max="100"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div>
        <div class="row">
          <el-input v-model="templateTitle" placeholder="请输入模板标题" size="mini"></el-input>
        </div>
        <div class="row">
          <el-dropdown
            size="mini"
            split-button
            type="primary"
            trigger="click"
            class="bar-button interactable"
            @click="hide"
            @command="(command) => {command()}">
            最小化
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="close">退出编辑器</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
  name: 'watermarkTemplate',
  data () {
    return  {
      index: this.$route.query.index,
      text: '',
      writingMode: 'horizontal-tb',
      textAlign: 'center',
      lineHeight: 1,
      letterSpacing: 0,
      position: 'center',
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      color: 'rgba(255, 255, 255, 1)',
      font: this.$store.state.fonts.defaultFont,
      relativeFontSize: 5,
      backgroundSize: 0,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      textShadowX: 0,
      textShadowY: 0,
      textShadowBlur: 0,
      textShadowColor: 'rgba(255, 255, 255, 0)',
      sizeBaseX: 0,
      sizeBaseY: 0,
      sampleWidth: 0,
      sampleHeight: 0,
      watermarkWidth: 0,
      watermarkHeight: 0,
      background: 'var(--black-gray)',
      templateTitle: ''
    }
  },
  computed: {
    fontSize() {
      return this.relativeFontSize * this.sizeBaseX
    },
    x() {
      if (this.position == 'top' || this.position == 'bottom' || this.position == 'center') {
        return ((this.sampleWidth - this.watermarkWidth) / 2)
      } else {
        let ratio = 1 - this.watermarkWidth / this.sampleWidth
        return this.offsetX * this.sizeBaseX * (ratio)
      }
    },
    y() {
      if (this.position == 'left' || this.position == 'right' || this.position == 'center') {
        return ((this.sampleHeight - this.watermarkHeight) / 2)
      } else {
        let ratio = 1 - this.watermarkHeight / this.sampleHeight
        return this.offsetY * this.sizeBaseY * (ratio)
      }
    },
    textShadow() {
      return this.textShadowX + 'em ' + this.textShadowY + 'em ' + this.textShadowBlur + 'em ' + this.textShadowColor
    }
  },
  watch: {
    text() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    writingMode() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    textAlign() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    lineHeight() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    letterSpacing() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    rotation() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    font() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    relativeFontSize() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    backgroundSize() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    backgroundColor() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    textShadowX() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    textShadowY() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    textShadowBlur() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    }
  },
  methods: {
    hide() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
      this.$destroy()
    },
    changePosition() {
      this.offsetX = 0
      this.offsetY = 0
    },
    exit() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '您确定要退出编辑器吗？您所作出的更改将会丢失。',
        showCancel: true,
        confirmFunction: () => {
          this.close()
        }
      })
    },
    initWatermarkSize() {
      let watermarkStyle = window.getComputedStyle(document.getElementById('watermark'))
      let watermarkWidth = watermarkStyle.getPropertyValue('width').slice(0, -2)
      let watermarkHeight = watermarkStyle.getPropertyValue('height').slice(0, -2)
      this.watermarkWidth = watermarkWidth
      this.watermarkHeight = watermarkHeight
    },
    save() {
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
      } else {
        let template =  {
          title: this.templateTitle,
          text: this.text,
          writingMode: this.writingMode,
          textAlign: this.textAlign,
          lineHeight: this.lineHeight,
          letterSpacing: this.letterSpacing,
          position: this.position,
          offsetX: this.offsetX,
          offsetY: this.offsetY,
          rotation: this.rotation,
          color: this.color,
          font: this.font,
          relativeFontSize: this.relativeFontSize,
          backgroundSize: this.backgroundSize,
          backgroundColor: this.backgroundColor,
          textShadowX: this.textShadowX,
          textShadowY: this.textShadowY,
          textShadowBlur: this.textShadowBlur,
          textShadowColor: this.textShadowColor,
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
                  title: '请输入水印模板标题',
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
            for (let i = 0; i < this.$store.state.watermark.templates.length; i++) {
              if (title == this.$store.state.watermark.templates[i].title && this.index != i) {
                this.$dialog({
                  type: 'warning',
                  title: '需要重命名',
                  text: '已存在同名模板，您需要更改当前模板的标题才能将其保存。',
                  showCancel: true,
                  confirmFunction: () => {
                    this.$dialog({
                      title: '请输入水印模板标题',
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
            this.$store.dispatch('watermark/templateReplace', {
              index: this.index,
              template: template
            })
            this.$dialog({
              type: 'success',
              title: '成功',
              text: '保存成功。是否关闭编辑器？',
              showCancel: true,
              confirmFunction: () => {
                this.close()
              }
            })
          }
        }
        checkName(this.templateTitle)
      }
    },
    saveAsNew() {
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
      } else {
        let template =  {
          title: this.templateTitle,
          text: this.text,
          writingMode: this.writingMode,
          textAlign: this.textAlign,
          lineHeight: this.lineHeight,
          letterSpacing: this.letterSpacing,
          position: this.position,
          offsetX: this.offsetX,
          offsetY: this.offsetY,
          rotation: this.rotation,
          color: this.color,
          font: this.font,
          relativeFontSize: this.relativeFontSize,
          backgroundSize: this.backgroundSize,
          backgroundColor: this.backgroundColor,
          textShadowX: this.textShadowX,
          textShadowY: this.textShadowY,
          textShadowBlur: this.textShadowBlur,
          textShadowColor: this.textShadowColor,
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
                  title: '请输入水印模板标题',
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
                        'font-family': 'var(--main-cont)'
                      }
                    })
                  ]),
                  showCancel: true,
                  confirmFunction: () => {
                    checkName(this.templateTitle)
                  }
                })
              }
            })
          } else {
            for (let i = 0; i < this.$store.state.watermark.templates.length; i++) {
              if (title == this.$store.state.watermark.templates[i].title) {
                this.$dialog({
                  type: 'warning',
                  title: '需要重命名',
                  text: '已存在同名模板，您需要更改当前模板的标题才能将其保存。',
                  showCancel: true,
                  confirmFunction: () => {
                    this.$dialog({
                      title: '请输入水印模板标题',
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
                      }
                    })
                  }
                })
                return
              }
            }
            template.title = title
            this.$store.dispatch('watermark/templatePush', template)
            this.$dialog({
              type: 'success',
              title: '成功',
              text: '保存成功。是否关闭编辑器？',
              showCancel: true,
              confirmFunction: () => {
                this.close()
              },
              cancelFunction: () => {
                this.index = this.$store.state.watermark.templates.length - 1
              }
            })
          }
        }
        checkName(this.templateTitle)
      }
    },
    deleteTemplate() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: () => {
          this.$store.dispatch('watermark/templateDelete', this.index)
          this.close()
        }
      })
    }
  },
  mounted() {
    let sample = document.getElementById('sample')
    let style = window.getComputedStyle(sample)
    let width = style.getPropertyValue('width').slice(0, -2)
    let height = style.getPropertyValue('height').slice(0, -2)
    this.sampleWidth = width
    this.sampleHeight = height
    this.sizeBaseX = width / 100
    this.sizeBaseY = height / 100
    if (this.$route.query.index != -1) {
      let template = this.$store.state.watermark.templates[this.$route.query.index]
      this.templateTitle = template.title !== undefined ? template.title : this.templateTitle
      this.text = template.text !== undefined ? template.text : this.text
      this.writingMode = template.writingMode !== undefined ? template.writingMode : this.writingMode
      this.textAlign = template.textAlign !== undefined ? template.textAlign : this.textAlign
      this.lineHeight = template.lineHeight !== undefined ? template.lineHeight : this.lineHeight
      this.letterSpacing = template.letterSpacing !== undefined ? template.letterSpacing : this.letterSpacing
      this.position = template.position !== undefined ? template.position : this.position
      this.offsetX = template.offsetX !== undefined ? template.offsetX : this.offsetX
      this.offsetY = template.offsetY !== undefined ? template.offsetY : this.offsetY
      this.rotation = template.rotation !== undefined ? template.rotation : this.rotation
      this.color = template.color !== undefined ? template.color : this.color
      this.font = template.font !== undefined ? template.font : this.font
      this.relativeFontSize = template.relativeFontSize !== undefined ? template.relativeFontSize : this.relativeFontSize
      this.backgroundSize = template.backgroundSize !== undefined ? template.backgroundSize : this.backgroundSize
      this.backgroundColor = template.backgroundColor !== undefined ? template.backgroundColor : this.backgroundColor
      this.textShadowX = template.textShadowX !== undefined ? template.textShadowX : this.textShadowX
      this.textShadowY = template.textShadowY !== undefined ? template.textShadowY : this.textShadowY
      this.textShadowBlur = template.textShadowBlur !== undefined ? template.textShadowBlur : this.textShadowBlur
      this.textShadowColor = template.textShadowColor !== undefined ? template.textShadowColor : this.textShadowColor
      this.$nextTick(() => {
        this.$dialog({
          text: '您正在编辑一个已保存的模板。如果您希望修改后覆盖原模板请点击“保存”，如果您希望将修改后的模板存储为副本请点击“另存”。',
          confirmFunction: () => {
            this.initWatermarkSize()
          }
        })
      })
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

.el-popper {
  -webkit-app-region: no-drag;
}

#watermark-template {
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
    height: 28px;
    flex-shrink: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
    .control {
      width: 60%;
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
  
  .bar-button {
    width: 0;
    flex-grow: 1;
    box-sizing: border-box;
    border: none;
    margin-left: 5px;
    margin-right: 5px;
    
    &:first-child {
      margin-left: 0;
    }
    
    &:last-child {
      margin-right: 0;
    }
  }
  
  .el-button-group {
    display: flex;
    
    button:not(.el-dropdown__caret-button) {
      width: 100%
    }
  }
  
  .el-button--primary:not(.el-dropdown__caret-button) {
    padding: 0;
    height: 28px;
  }
  
  #preview {
    width: calc(50% - 10px);
    height: 100%;
    display: flex;
    flex-direction: column;
    
    #sample {
      width: 100%;
      flex-grow: 1;
      background-size: 50px 50px;
      background-position: 0 0, 25px 25px;
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;
      
      #watermark-container {
        position: absolute;
        overflow: hidden;
        white-space: nowrap;
      }
      
      #watermark {
        position: absolute;
        width: fit-content;
        height: fit-content;
        box-sizing: border-box;
        line-height: 1em;
      }
    }
  }
  
  #control {
    width: calc(50% - 10px);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .el-collapse-item__header {
      height: 30px;
      font-size: 14px;
    }
    
    .el-collapse-item__content {
      padding-top: 10px;
      padding-bottom: 10px;
    }
    
    .el-textarea__inner {
      font-family: var(--main-font)
    }
      
    textarea {
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
  }
}
</style>

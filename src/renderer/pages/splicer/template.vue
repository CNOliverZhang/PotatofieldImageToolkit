<template>
  <div id="splicer-template">
    <div id="header">
      <div id="title">长图拼接工具 - 模板编辑器</div>
      <div id="minimize" class="control-button" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div id="maximize" class="control-button" @click="maximize">
        <object data="static/images/maximize.svg" type="image/svg+xml"></object>
      </div>
      <div id="close" class="control-button" @click="close">
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
        <div id="samples-wrapper">
          <div v-if="vertical" id="vertical-samples-container">
            <div
              id="samples"
              :style="{
                'padding': padding + 'px',
                'background-color': backgroundColor
              }">
              <div
                v-for="(object, index) in Array.from({ length: sampleCount })"
                :key="index"
                class="sample-container">
                <div
                  class="sample"
                  :style="{
                    'margin-top': index == 0 ? 0 : spacing + 'px',
                    'border-radius': borderRadius + 'px',
                    'background-image': sampleColor == 'dark' ? 'linear-gradient(135deg, var(--dark-gray), var(--black-gray))' : 'linear-gradient(135deg, var(--gray), var(--white-gray))',
                    'color': sampleColor == 'dark' ? 'var(--white-gray)' : 'var(--black-gray)'
                  }">
                  <div class="subtitle">参照图片</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else id="horizontal-samples-container">
            <div
              id="samples"
              :style="{
                'padding': padding + 'px',
                'background-color': backgroundColor
              }">
              <div
                v-for="(object, index) in Array.from({ length: sampleCount })"
                :key="index"
                class="sample-container">
                <div
                  class="sample"
                  :style="{
                    'margin-left': index == 0 ? 0 : spacing + 'px',
                    'border-radius': borderRadius + 'px',
                    'background-image': sampleColor == 'dark' ? 'linear-gradient(135deg, var(--dark-gray), var(--black-gray))' : 'linear-gradient(135deg, var(--gray), var(--white-gray))',
                    'color': sampleColor == 'dark' ? 'var(--white-gray)' : 'var(--black-gray)'
                  }">
                  <div class="subtitle">参照图片</div>
                </div>
              </div>
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
                  <div class="subtitle">参照图片设置</div>
                </div>
                <div class="control-row">
                  <div class="text">参照图片数量</div>
                </div>
                <div class="control-row">
                  <el-select v-model="sampleCount" size="mini" class="control">
                    <el-option
                      v-for="(object, index) in Array.from({ length: 10 })"
                      :key="index"
                      :label="(index + 1) + ' 张'"
                      :value="index + 1"/>
                  </el-select>
                </div>
                <div class="control-row">
                  <div class="text">参照图片颜色</div>
                </div>
                <div class="control-row">
                  <el-select v-model="sampleColor" size="mini" class="control">
                    <el-option label="深色" value="dark"/>
                    <el-option label="浅色" value="bright"/>
                  </el-select>
                </div>
                <div class="row">
                  <div class="subtitle">拼接方向设置</div>
                </div>
                <div class="control-row">
                  <el-switch
                    v-model="vertical"
                    active-color="var(--main-color)"
                    inactive-color="var(--main-color)"
                    active-text="纵向拼接"
                    inactive-text="横向拼接"
                    class="control"
                    @change="changeDirection"></el-switch>
                </div>
                <div class="row">
                  <div class="subtitle">拼接样式设置</div>
                </div>
                <div class="control-row">
                  <div class="text">边框颜色</div>
                  <el-color-picker v-model="backgroundColor" size="mini" :show-alpha="true"></el-color-picker>
                </div>
                <div class="control-row">
                  <div class="text">外框宽度</div>
                </div>
                <div class="control-row">
                  <el-slider
                    v-model="padding"
                    class="control"
                    :min="0"
                    :max="100"
                    :step="1"
                    :show-input="true"
                    input-size="mini"></el-slider>
                </div>
                <div class="control-row">
                  <div class="text">图片间距</div>
                </div>
                <div class="control-row">
                  <el-slider
                    v-model="spacing"
                    class="control"
                    :min="0"
                    :max="100"
                    :step="1"
                    :show-input="true"
                    input-size="mini"></el-slider>
                </div>
                <div class="control-row">
                  <div class="text">图片圆角</div>
                </div>
                <div class="control-row">
                  <el-slider
                    v-model="borderRadius"
                    class="control"
                    :min="0"
                    :max="100"
                    :step="1"
                    :show-input="true"
                    input-size="mini"></el-slider>
                </div>
              </div>
              <div id="name">
                <div class="row">
                  <div class="subtitle">模板名称设置</div>
                </div>
                <div class="row">
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
  name: 'splicerTemplate',
  data () {
    return  {
      index: this.$route.query.index,
      vertical: true,
      padding: 0,
      spacing: 0,
      borderRadius: 0,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      sampleCount: 5,
      sampleColor: 'dark',
      templateTitle: ''
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
      this.$router.replace('/splicer')
    },
    close() {
      ipcRenderer.send('close')
      this.$destroy()
    },
    changeDirection(vertical) {
      if (!vertical) {
        this.$nextTick(() => {
          document.getElementById('horizontal-samples-container').addEventListener('mousewheel', (event) => {
            if (document.getElementById('horizontal-samples-container')) {
              document.getElementById('horizontal-samples-container').scrollLeft -= event.wheelDelta / 2
              event.preventDefault()
            }
          })
        })
      }
    },
    save() {
      let template =  {
        title: this.templateTitle,
        padding: this.padding,
        spacing: this.spacing,
        borderRadius: this.borderRadius,
        backgroundColor: this.backgroundColor
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
                title: '请输入长图拼接模板标题',
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
          for (let i = 0; i < this.$store.state.splicer.templates.length; i++) {
            if (title == this.$store.state.splicer.templates[i].title && this.index != i) {
              this.$dialog({
                type: 'warning',
                title: '需要重命名',
                text: '已存在同名模板，您需要更改当前模板的标题才能将其保存。',
                showCancel: true,
                confirmFunction: () => {
                  this.$dialog({
                    title: '请输入长图拼接模板标题',
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
          this.$store.dispatch('splicer/templateReplace', {
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
        spacing: this.spacing,
        borderRadius: this.borderRadius,
        backgroundColor: this.backgroundColor
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
                title: '请输入长图拼接模板标题',
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
        } else {
          for (let i = 0; i < this.$store.state.splicer.templates.length; i++) {
            if (title == this.$store.state.splicer.templates[i].title) {
              this.$dialog({
                type: 'warning',
                title: '需要重命名',
                text: '已存在同名模板，您需要更改当前模板的标题才能将其保存。',
                showCancel: true,
                confirmFunction: () => {
                  this.$dialog({
                    title: '请输入长图拼接模板标题',
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
          this.$store.dispatch('splicer/templatePush', template)
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
    },
    deleteTemplate(index) {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: (index) => {
          this.$store.dispatch('splicer/templateDelete', index)
          this.back()
        }
      })
    }
  },
  mounted() {
    if (this.$route.query.index != -1) {
      let template = this.$store.state.splicer.templates[this.$route.query.index]
      this.templateTitle = template.title !== undefined ? template.title : this.templateTitle
      this.padding = template.padding !== undefined ? template.padding : this.padding
      this.spacing = template.spacing !== undefined ? template.spacing : this.spacing
      this.borderRadius = template.borderRadius !== undefined ? template.borderRadius : this.borderRadius
      this.backgroundColor = template.backgroundColor !== undefined ? template.backgroundColor : this.backgroundColor
      this.$dialog({
        text: '您正在编辑一个已保存的模板。如果您希望修改后覆盖原模板请点击“保存”，如果您希望将修改后的模板存储为副本请点击“另存”。'
      })
    }
  }
}
</script>

<style lang="scss">  
.el-color-dropdown {
  button {
    font-family: var(--main-font);
  }
}

#splicer-template {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  button {
    font-family: var(--main-font);
  }
  
  input {
    font-family: var(--main-font);
  }

  #header {
    padding-left: 20px;
    padding-right: 20px;
    box-sizing: border-box;
    flex-basis: 40px;
    background-color: var(--dark-gray);
    display: flex;
    align-items: center;
    z-index: 3000;
    -webkit-app-region: drag;

    #title {
      color: var(--white);
      font-size: 16px;
      flex-grow: 1;
    }

    .control-button {
      -webkit-app-region: no-drag;
      width: 20px;
      height: 20px;
      margin-left: 5px;
      margin-right: 5px;
      border-radius: 10px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      object {
        width: 50%;
        color: var(--white);
      }

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }

      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        border-radius: 50%;
        transition: 0.2s;
      }

      &:hover::after {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    #minimize {
      background-color: var(--success-green);
    }

    #maximize {
      background-color: var(--notice-yellow);
    }

    #close {
      background-color: var(--warning-red);
    }
  }

  #content {
    height: 0;
    width: 100%;
    flex-grow: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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
      width: 100%;
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
    height: 28px;
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
  
  #left {
    width: 0;
    height: 100%;
    flex-grow: 1;
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

    #samples-wrapper {
      width: 100%;
      height: 0;
      flex-grow: 1;
      padding-left: 20px;
      padding-top: 20px;
      padding-bottom: 20px;
      box-sizing: border-box;
    
      #vertical-samples-container {
        width: 100%;
        height: 100%;
        background-color: var(--black-gray);
        border-color: var(--light-gray);
        border-style: solid;
        border-width: 1px;
        box-sizing: border-box;
        border-radius: 6px;
        overflow-x: hidden;
        overflow-y: auto;
        text-align: center;
          
        #samples {
          width: 400px;
          box-sizing: border-box;
          display: inline-block;
          
          .sample-container {
            width: 100%;
            
            .sample {
              width: 100%;
              height: 300px;
              display: flex;
              justify-content: center;
              align-items: center;
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

      #horizontal-samples-container {
        width: 100%;
        height: 100%;
        background-color: var(--black-gray);
        border-color: var(--light-gray);
        border-style: solid;
        border-width: 1px;
        box-sizing: border-box;
        border-radius: 6px;
        overflow-x: auto;
        overflow-y: hidden;
        display: flex;
        align-items: center;
          
        #samples {
          height: 400px;
          width: fit-content;
          box-sizing: border-box;
          white-space: nowrap;
          
          .sample-container {
            height: 100%;
            display: inline-block;
            
            .sample {
              width: 600px;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          }
        }
        
        &::-webkit-scrollbar {
          height: 10px;
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

        #name {
          margin-top: 10px;
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

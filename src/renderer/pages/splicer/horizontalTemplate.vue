<template>
  <div id="splicer-horizontal-template">
    <div id="samples-container" class="interactable">
      <div
        id="samples"
        :style="{
          'padding': padding + 'px',
          'background-color': backgroundColor
        }">
        <div
          v-for="(color, index) in ['--black-gray', '--dark-gray', '--gray', '--light-gray']"
          :key="index"
          class="sample-container">
          <div
            class="sample"
            :style="{
              'margin-left': index == 0 ? 0 : spacing + 'px',
              'border-radius': borderRadius + 'px',
              'background-color': 'var(' + color + ')'
            }">
            <div class="subtitle">样例图片</div>
          </div>
        </div>
      </div>
    </div>
    <div id="control" class="interactable">
      <div id="left">
        <div class="row">
          <el-button type="primary" size="mini" @click="switchDirection" class="bar-button">切换拼接方向</el-button>
        </div>
        <div class="control-row">
          <div class="text">边框颜色</div>
          <el-color-picker v-model="backgroundColor" size="mini"></el-color-picker>
        </div>
        <div class="control-row">
          <div class="text">外框宽度</div>
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
      <div id="right">
        <el-input v-model="templateTitle" placeholder="请输入模板标题" size="mini"></el-input>
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
  name: 'splicerHorizontalTemplate',
  data () {
    return  {
      index: this.$route.query.index,
      padding: 0,
      spacing: 0,
      borderRadius: 0,
      backgroundColor: '#FFFFFF',
      templateTitle: ''
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
    switchDirection() {
      this.$router.replace('/splicer/template?index=' + this.index)
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
            text: '保存成功。是否关闭编辑器？',
            showCancel: true,
            confirmFunction: () => {
              this.close()
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
            text: '保存成功。是否关闭编辑器？',
            showCancel: true,
            confirmFunction: () => {
              this.close()
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
          this.close()
        }
      })
    }
  },
  mounted() {
    document.getElementById('samples-container').addEventListener('mousewheel', (event) => {
      document.getElementById('samples-container').scrollLeft -= event.wheelDelta / 2
      event.preventDefault()
    })
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
.el-color-picker__panel {
  -webkit-app-region: no-drag;
  
  button {
    font-family: var(--main-font);
  }
}

.el-popper {
  -webkit-app-region: no-drag;
}

#splicer-horizontal-template {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
    
  #samples-container {
    width: 100%;
    height: 0;
    flex-grow: 1;
    margin-bottom: 10px;
    background-color: var(--black-gray);
    border-color: var(--light-gray);
    border-style: solid;
    border-width: 1px;
    box-sizing: border-box;
    border-radius: 6px;
    overflow-x: auto;
    overflow-y: hidden;
      
    #samples {
      height: 100%;
      width: fit-content;
      box-sizing: border-box;
      white-space: nowrap;
      
      .sample-container {
        height: 100%;
        display: inline-block;
        
        .sample {
          width: 450px;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--white);
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
  
  #control {
    width: 100%;
    display: flex;
    justify-content: space-between;
    
    #left {
      width: calc(50% - 10px);
    }
    
    #right {
      width: calc(50% - 10px);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
  }
}
</style>

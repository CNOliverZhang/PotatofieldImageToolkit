<template>
  <div id="splicer-template">
    <div id="samples-container" class="interactable">
      <div
        id="samples"
        :style="{
          'padding': padding + 'px',
          'background-color': backgroundColor
        }">
        <div class="sample-container">
          <div
            class="sample"
            :style="{
              'margin-bottom': spacing + 'px',
              'border-radius': borderRadius + 'px',
              'background-color': 'var(--black-gray)'
            }">
            <div class="subtitle">样例图片</div>
          </div>
          <div
            class="sample"
            :style="{
              'margin-bottom': spacing + 'px',
              'border-radius': borderRadius + 'px',
              'background-color': 'var(--dark-gray)'
            }">
            <div class="subtitle">样例图片</div>
          </div>
          <div
            class="sample"
            :style="{
              'margin-bottom': spacing + 'px',
              'border-radius': borderRadius + 'px',
              'background-color': 'var(--gray)'
            }">
            <div class="subtitle">样例图片</div>
          </div>
        </div>
      </div>
    </div>
    <div id="control" class="interactable">
      <div id="controller">
        <div class="row">
          <div class="subtitle">拼图样式设置</div>
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
        <div class="control-row">
          <div class="text">边框颜色</div>
          <el-color-picker v-model="backgroundColor" size="mini"></el-color-picker>
        </div>
      </div>
      <el-input v-model="templateTitle" placeholder="请输入模板标题" size="mini"></el-input>
      <div class="row">
        <el-button type="primary" size="mini" @click="exit" class="control-button">退出编辑器</el-button>
        <el-button v-if="index != -1" type="primary" size="mini" @click="save" class="control-button">保存</el-button>
        <el-button type="primary" size="mini" @click="saveAsNew" class="control-button">{{ index == -1 ? '保存' : '另存'}}</el-button>
        <el-button v-if="index != -1" type="primary" size="mini" @click="deleteTemplate" class="control-button">删除</el-button>
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
      padding: 0,
      spacing: 0,
      borderRadius: 0,
      backgroundColor: '#FFFFFF',
      templateTitle: ''
    }
  },
  methods: {
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
                title: '请输入拼图模板标题',
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
                    title: '请输入拼图模板标题',
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
                title: '请输入拼图模板标题',
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
                    title: '请输入拼图模板标题',
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
    if (this.$route.query.index != -1) {
      let index = this.$route.query.index
      this.templateTitle = this.$store.state.splicer.templates[index].title
      this.padding = this.$store.state.splicer.templates[index].padding
      this.spacing = this.$store.state.splicer.templates[index].spacing
      this.borderRadius = this.$store.state.splicer.templates[index].borderRadius
      this.backgroundColor = this.$store.state.splicer.templates[index].backgroundColor
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

#splicer-template {
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
    
  #samples-container {
    width: calc(50% - 10px);
    height: 100%;
    flex-shrink: 0;
    background-color: var(--dark-gray);
    border-color: var(--light-gray);
    border-style: solid;
    border-width: 1px;
    box-sizing: border-box;
    border-radius: 6px;
    overflow-x: hidden;
    overflow-y: auto;
      
    #samples {
      width: 100%;
      box-sizing: border-box;
      
      .sample-container {
        width: 100%;
        position: relative;
        
        .sample {
          width: 100%;
          height: 300px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--white);
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
  
  #control {
    width: calc(50% - 10px);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    #controller {
      flex-grow: 1;
    }
    
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
  }
}
</style>

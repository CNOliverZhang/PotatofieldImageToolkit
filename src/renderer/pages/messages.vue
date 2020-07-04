<template>
  <div id="messages">
    <div class="page-header">
      <div class="page-title">消息中心</div>
      <div class="control-button minimize" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div class="control-button close" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <el-tabs type="card" tab-position="top" id="content">
      <el-tab-pane>
        <span slot="label"><i class="fas fa-envelope"></i> 未读消息</span>
        <div class="tab-content">
          <div class="container" v-if="unreadMessages.length != 0">
            <div
              v-for="message in unreadMessages.slice(unreadMessageListPage * 6 - 6, unreadMessageListPage * 6)"
              :key="message.id"
              class="card-container">
              <div class="card">
                <div>
                  <div class="row">
                    <div class="subtitle">{{ message.title }}</div>
                  </div>
                  <div class="row">
                    <v-clamp autoresize :max-lines="3" class="text">{{ message.text }}</v-clamp>
                  </div>
                </div>
                <div class="row actions">
                  <div class="action active" @click="showMessage(message)">
                    <span class="fa fa-envelope"></span>
                    <div>阅读消息</div>
                  </div>
                  <div class="action">
                    <div>{{ message.pub_date }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="container" v-else>
            <div  class="empty-container">
              <div class="empty">
                <i class="fas fa-envelope"></i>
                <div>没有未读消息</div>
              </div>
            </div>
          </div>
          <div class="row">
            <el-pagination
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="unreadMessages.length"
              :current-page="unreadMessageListPage"
              @current-change="unreadMessageListPageChange">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="fas fa-envelope-open"></i> 全部消息</span>
        <div class="tab-content">
          <div class="container" v-if="messages.length != 0">
            <div
              v-for="message in messages.slice(messageListPage * 6 - 6, messageListPage * 6)"
              :key="message.id"
              class="card-container">
              <div class="card">
                <div>
                  <div class="row">
                    <div class="subtitle">{{ message.title }}</div>
                  </div>
                  <div class="row">
                    <v-clamp autoresize :max-lines="3" class="text">{{ message.text }}</v-clamp>
                  </div>
                </div>
                <div class="row actions">
                  <div
                    class="action active"
                    key="newMessage"
                    v-if="$store.state.messages.messageList.indexOf(message.id) == -1"
                    @click="showMessage(message)">
                    <span class="fa fa-envelope"></span>
                    <div>阅读消息</div>
                  </div>
                  <div
                    class="action active"
                    key="oldMessage"
                    v-else
                    @click="showMessage(message)">
                    <span class="fa fa-envelope-open"></span>
                    <div>阅读消息</div>
                  </div>
                  <div class="action">
                    <div>{{ message.pub_date }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="container" v-else>
            <div  class="empty-container">
              <div class="empty">
                <i class="fas fa-envelope"></i>
                <div>没有未读消息</div>
              </div>
            </div>
          </div>
          <div class="row">
            <el-pagination
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="messages.length"
              :current-page="messageListPage"
              @current-change="messageListPageChange">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'messages',
  data () {
    return {
      messages: [],
      messageListPage: 1,
      unreadMessageListPage: 1
    }
  },
  computed: {
    unreadMessages() {
      return this.messages.filter((message) => {
        return this.$store.state.messages.messageList.indexOf(message.id) == -1
      })
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
      this.$destroy()
    },
    messageListPageChange(page) {
      this.messageListPage = page
    },
    unreadMessageListPageChange(page) {
      this.unreadMessageListPage = page
    },
    showMessage(message) {
      this.$dialog({
        title: message.title,
        text: message.text
      })
      if (this.$store.state.messages.messageList.indexOf(message.id) == -1) {
        this.$store.dispatch('messages/markRead', message.id)
      }
    }
  },
  mounted() {
    this.$dialog({
      title: '正在获取消息',
      text: '正在向服务器请求消息列表，请稍候。',
      showConfirm: false
    }).then((dialog) => {
      this.$http.get('https://api.potatofield.cn/imagetoolkit/messages').catch((error) => {
        dialog.change({
          type: 'error',
          title: '出现错误',
          text: '获取消息列表失败，请检查您的网络。',
          showConfirm: true,
          confirmFunction: () => {
            this.close()
          }
        })
      }).then((res) => {
        this.messages = res.data.map((message) => {
          let list = message.pub_date.split('-')
          let pub_date = list[0] + ' 年 ' + list[1] + ' 月 ' + list[2] + ' 日'
          message.pub_date = pub_date
          return message
        })
        dialog.close()
      })
    })
  }
}
</script>

<style lang="scss">
#messages {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  #content {
    height: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  
    .el-tabs__header {
      margin: 0;
      
      .el-tabs__nav-scroll {
        background-color: var(--main-color);
        
        .el-tabs__nav {
          border: 0;
          
          .el-tabs__item {
            width: 150px;
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
        
        .tab-content {
          width: 100%;
          height: 100%;
          padding: 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
      }
    }
    
    .container {
      width: 100%;
      height: 0;
      flex-grow: 1;
      display: flex;
      flex-wrap: wrap;
      
      .card-container {
        width: calc(100% / 3);
        height: 50%;
        box-sizing: border-box;
        padding: 10px;
        
        .card {
          width: 100%;
          height: 100%;
          padding: 20px;
          box-sizing: border-box;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 12px var(--card-shadow);
          transition: 0.2s;
            
          .subtitle {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .text {
            text-indent: 2em;
          }
          
          .actions {
            width: 100%;
            flex-grow: 1;
            align-items: flex-end;
            
            .action {
              display: flex;
              align-items: center;
              color: var(--gray);
              font-size: 12px;
              transition: 0.2s;
              
              svg {
                font-size: 14px;
                margin-right: 5px;
              }
            }
            
            .active {
              color: var(--dark-gray);
              cursor: pointer;
              
              &:hover {
                color: var(--main-color);
              }
              
              &:active {
                filter: brightness(0.9);
              }
            }
          }
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
    
    .empty-container {
      width: 100%;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      
      .empty {
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
}
</style>

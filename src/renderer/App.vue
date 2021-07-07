<template>
  <router-view></router-view>
</template>

<script>
const path = require('path')

export default {
  name: 'potatofield-image-toolkit',
  mounted() {
    let style = document.createElement('style')
    this.$store.state.fonts.fontList.forEach((font) => {
      style.appendChild(document.createTextNode(`
        @font-face {
            font-family: ${font.fontFamily}（${font.fontStyle}）;
            src: url("${font.fontFile}");
        }
      `))
    })
    document.head.appendChild(style)
    document.body.style.setProperty('--main-font', this.$store.state.fonts.defaultFont)
    document.body.classList.add('potatofield-image-toolkit')
  }
}
</script>

<style lang="scss">
:root {
  --main-font: "思源黑体（极细）";
  --main-color: #2196F3;
  --success-green: #67C23A;
  --notice-yellow: #E6A23C;
  --warning-red: #F56C6C;
  --black-gray: #303133;
  --dark-gray: #606266;
  --gray: #C0C4CC;
  --light-gray: #DCDFE6;
  --white-gray: #F5F7FA;
  --white: #FFFFFF;
  --black: #000000;
  --transparent: rgba(255, 255, 255, 0);
  --transparent-black-cover: rgba(0, 0, 0, 0.3);
  --transparent-white-cover: rgba(255, 255, 255, 0.3);
  --card-shadow: rgba(0, 0, 0, 0.1);
}

.potatofield-image-toolkit {
  width: 100vw;
  height: 100vh;
  margin: 0;
  font-family: var(--main-font);
  cursor: default;
  user-select: none;
  color: var(--dark-gray);

  input {
    font-family: var(--main-font);
  }

  button {
    font-family: var(--main-font);
  }

  .page-header {
    padding-left: 20px;
    padding-right: 20px;
    box-sizing: border-box;
    flex-basis: 40px;
    background-color: var(--black-gray);
    display: flex;
    align-items: center;
    z-index: 3000;
    -webkit-app-region: drag;

    .page-title {
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

      &.minimize {
        background-color: var(--success-green);
      }

      &.maximize {
        background-color: var(--notice-yellow);
      }

      &.close {
        background-color: var(--warning-red);
      }

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
  }

  .tool-templates {
    flex-direction: column;
    
    .templates-container {
      width: 100%;
      height: 0;
      flex-grow: 1;
      display: flex;
      flex-wrap: wrap;
      
      .template-container {
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
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .text {
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

          .clamp {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .actions {
            width: 100%;
            flex-grow: 1;
            align-items: flex-end;
            
            .action {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              font-size: 12px;
              width: 32px;
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

  .title {
    font-size: 32px;
    line-height: 1.6em;
  }

  .subtitle {
    font-size: 18px;
    line-height: 1.6em;
  }

  .text {
    font-size: 14px;
    line-height: 1.6em;
    text-align: justify;
  }

  .subtext {
    font-size: 12px;
    line-height: 1.6em;
    text-align: justify;
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

    .full-width-control {
      width: 100%;
    }

    .half-width-control {
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

    .full-width-control {
      width: 100%;
    }
    
    .half-width-control {
      width: 60%;
    }
    
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
    padding-left: 0;
    padding-right: 0;
    margin-left: 5px;
    margin-right: 5px;
    
    &:first-child {
      margin-left: 0;
    }
    
    &:last-child {
      margin-right: 0;
    }
  }

  .el-switch__label:not(.is-active) {
    color: var(--dark-gray);
  }

  .el-popover {
    font-size: 12px;

    .el-popover__title {
      font-size: 14px;
      color: var(--dark-gray);
    }
  }

  .el-collapse {
    .el-collapse-item__header {
      color: var(--dark-gray);
    }

    .el-collapse-item__content {
      color: var(--dark-gray);
    }
  }

  .el-pagination {
    padding: 0;
    margin-right: 10px;

    .el-pager {
      .number, .more {
        min-width: 24px;
        height: 28px;
        line-height: 28px;
      }
    }
    
    .btn-prev {
      width: 24px;
      height: 28px;
      line-height: 28px;
      margin-left: 0;
    }
    
    .btn-next {
      width: 24px;
      height: 28px;
      line-height: 28px;
      margin-right: 0;
    }
  }
}
</style>

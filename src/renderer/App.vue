<template>
  <div id="app">
    <router-view></router-view>
  </div>
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
            font-family: ${font.fontFamily};
            src: url("${font.src}");
        }
      `))
    })
    document.head.appendChild(style)
    document.body.style.setProperty('--main-font', this.$store.state.fonts.defaultFont)
  }
}
</script>

<style lang="scss">
:root {
  --main-font: "NotoSansSCThin";
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
}

body {
  margin: 0;
  font-family: var(--main-font);
  cursor: default;
  user-select: none;
  color: var(--dark-gray);
}

#app {
  width: 100vw;
  height: 100vh;
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
</style>

<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'potatofield-image-toolkit'
  }
</script>

<style lang="scss">
@font-face {
  font-family: NotoSansSC;
  src: url('./assets/NotoSansSC-Thin.otf');
}

body {
  margin: 0;
  font-family: "NotoSansSC";
  cursor: default;
  -webkit-app-region: drag;
  user-select: none;
  color: #606266;
}

#app {
  width: 100vw;
  height: 100vh;
}

.interactable {
  -webkit-app-region: no-drag;
}

.title {
  font-size: 32px;
}

.subtitle {
  font-size: 18px;
}

.text {
  font-size: 14px;
  text-align: justify;
}

.subtext {
  font-size: 12px;
}
</style>

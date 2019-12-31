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

<style>
@font-face {
  font-family: SourceHanSansSC;
  src: url('./assets/SourceHanSansSC-ExtraLight.otf');
}

body {
  margin: 0;
  font-family: "SourceHanSansSC";
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

.flex-space {
  flex-grow: 1;
}

.title {
  font-size: 32px;
}

.subtitle {
  font-size: 18px;
}

.subtext {
  font-size: 12px;
}
</style>

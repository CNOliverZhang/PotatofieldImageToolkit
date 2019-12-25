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
  
  #app {
    font-family: "SourceHanSansSC";
    cursor: default;
    -webkit-app-region: drag;
    user-select: none;
  }
  
  body {
    margin: 0;
    border: 0;
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
</style>

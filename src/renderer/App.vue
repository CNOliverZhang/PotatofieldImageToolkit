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

@font-face {
  font-family: NotoSansSCThin;
  src: url('./assets/NotoSansSC-Thin.otf');
}

@font-face {
  font-family: NotoSansSCRegular;
  src: url('./assets/NotoSansSC-Regular.otf');
}

@font-face {
  font-family: NotoSansSCBlack;
  src: url('./assets/NotoSansSC-Black.otf');
}

@font-face {
  font-family: NotoSerifSCThin;
  src: url('./assets/NotoSerifSC-ExtraLight.otf');
}

@font-face {
  font-family: NotoSerifSCRegular;
  src: url('./assets/NotoSerifSC-Regular.otf');
}

@font-face {
  font-family: NotoSerifSCBlack;
  src: url('./assets/NotoSerifSC-Black.otf');
}

@font-face {
  font-family: ZCoolHuangyou;
  src: url('./assets/ZCOOLQingKeHuangYou-Regular.ttf');
}

@font-face {
  font-family: ZCoolXiaowei;
  src: url('./assets/ZCOOLXiaoWei-Regular.ttf');
}

@font-face {
  font-family: ZCoolKuaile;
  src: url('./assets/ZCOOLKuaiLe-Regular.ttf');
}

@font-face {
  font-family: ZCoolWenyi;
  src: url('./assets/ZCOOLWenYi-Regular.ttf');
}

@font-face {
  font-family: ZCoolKuhei;
  src: url('./assets/ZCOOLKuHei-Regular.ttf');
}

@font-face {
  font-family: ZCoolGaoduanhei;
  src: url('./assets/ZCOOLGaoDuanHei-Regular.ttf');
}

@font-face {
  font-family: ZCoolAddict;
  src: url('./assets/ZCOOLAddict-Italic.ttf');
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

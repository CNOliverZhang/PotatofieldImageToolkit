import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'index',
      component: require('@/pages/index').default
    },
    {
      path: '/about',
      name: 'about',
      component: require('@/pages/about').default
    },
    {
      path: '/watermark',
      name: 'watermark',
      component: require('@/pages/watermark').default,
    },
    {
      path: '/watermark/editor',
      name: 'watermarkEditor',
      component: require('@/pages/watermark/editor').default
    },
    {
      path: '/watermark/template',
      name: 'watermarkTemplate',
      component: require('@/pages/watermark/template').default
    },
    {
      path: '/splicer',
      name: 'splicer',
      component: require('@/pages/splicer').default,
    },
    {
      path: '/splicer/editor',
      name: 'splicerEditor',
      component: require('@/pages/splicer/editor').default
    },
    {
      path: '/splicer/template',
      name: 'splicerTemplate',
      component: require('@/pages/splicer/template').default
    },
    {
      path: '/splicer/horizontalEditor',
      name: 'splicerHorizontalEditor',
      component: require('@/pages/splicer/horizontalEditor').default
    },
    {
      path: '/splicer/horizontalTemplate',
      name: 'splicerHorizontalTemplate',
      component: require('@/pages/splicer/horizontalTemplate').default
    },
    {
      path: '/slice',
      name: 'slice',
      component: require('@/pages/slice').default
    },
    {
      path: '/slice/editor',
      name: 'sliceEditor',
      component: require('@/pages/slice/editor').default
    },
    {
      path: '/textToImage',
      name: 'textToImage',
      component: require('@/pages/textToImage').default
    },
    {
      path: '/textToImage/editor',
      name: 'textToImageEditor',
      component: require('@/pages/textToImage/editor').default
    },
    {
      path: '/textToImage/template',
      name: 'textToImageTemplate',
      component: require('@/pages/textToImage/template').default
    },
    {
      path: '/resizer',
      name: 'resizer',
      component: require('@/pages/resizer').default
    },
    {
      path: '/cropper',
      name: 'cropper',
      component: require('@/pages/cropper').default
    },
    {
      path: '/cropper/editor',
      name: 'cropperEditor',
      component: require('@/pages/cropper/editor').default
    },
    {
      path: '/exif',
      name: 'exif',
      component: require('@/pages/exif').default
    },
    {
      path: '/fonts',
      name: 'fonts',
      component: require('@/pages/fonts').default
    },
    {
      path: '/palette',
      name: 'palette',
      component: require('@/pages/palette').default
    },
    {
      path: '/compress',
      name: 'compress',
      component: require('@/pages/compress').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

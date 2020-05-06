require('dotenv').config()

const env = process.env
const isProd = env.MODE == 'prod'

let mockServer = 'http://yapi.deepexi.io:5002/mock/898'
// 不能以斜杠结尾
let apiServer = process.env.API_SERVER

const metaJson = require('./meta.json')
const materialJson = require('../../material.json')
const outputDir = `dist${metaJson.hash}`
const ossPath = `http://serverless-platform.deepexi.top/materials/${
  materialJson.materialId
}/${outputDir}`

const publicPath = process.env.NODE_ENV === 'production' ? ossPath : ''

const config = {
  aliIconFont: '',
  env: {
    mock: {
      '/security': mockServer,
      '/hsp-trade-center': 'http://39.98.50.163:3000/mock/1259',
      '/hsp-member-center': 'http://39.98.50.163:3000/mock/1104',
      '/hsp-auth-center': 'http://39.98.50.163:3000/mock/1144',
      '/hsp-datastatistics-center': 'http://39.98.50.163:3000/mock/1252',
      '/hsp-wechat-center': 'http://39.98.50.163:3000/mock/1120',
      '/hsp-message-center': 'http://39.98.50.163:3000/mock/1128'
    },
    dev: {
      '/security': mockServer,
      '/hsp-trade-center': 'http://101.37.158.194:8000',
      '/hsp-member-center': 'http://101.37.158.194:8000',
      '/hsp-auth-center': 'http://101.37.158.194:8000',
      '/hsp-datastatistics-center': 'http://101.37.158.194:8000',
      '/hsp-wechat-center': 'http://101.37.158.194:8000',
      '/hsp-message-center': 'http://101.37.158.194:8000'
    }
  }
}
let axios = {
  proxy: true
}

// 如果生产指定apiServer, 则使用绝对路径请求api
if (isProd && apiServer) {
  axios = {
    proxy: false,
    baseURL: apiServer
  }
}

module.exports = {
  mode: 'spa',
  env: {
    NO_LOGIN: process.env.NO_LOGIN
  },
  proxy: config.env[env.MODE],
  router: {
    middleware: ['meta'],
    mode: 'hash'
  },
  /*
   ** Build configuration
   */
  generate: {
    dir: outputDir
  },
  build: {
    publicPath,
    extractCSS: true,
    babel: {
      plugins: [
        [
          'component',
          {
            libraryName: 'element-ui',
            styleLibraryName: '~theme'
          }
        ]
      ]
    },
    /*
     ** Run ESLint on save
     */
    extend(config, {isDev}) {
      if (isDev && process.client) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  /*
   ** Headers of the page
   */
  head: {
    title: 'Optimus',
    meta: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        'http-equiv': 'x-ua-compatible',
        content: 'IE=edge, chrome=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: '开发平台'
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href:
          'https://deepexi.oss-cn-shenzhen.aliyuncs.com/deepexi-services/favicon32x32.png'
      }
      // {
      //   rel: 'stylesheet',
      //   type: 'text/css',
      //   href: config.aliIconFont
      // }
    ]
  },
  /*
   ** Customize the progress bar color
   */
  loading: {
    color: '#1890ff'
  },
  css: [
    {
      src: '~assets/global.less',
      lang: 'less'
    }
  ],
  srcDir: 'src/',
  plugins: [
    {
      src: '~/plugins/axios'
    },
    {
      src: '~/plugins/element'
    }
  ],
  // https://github.com/nuxt-community/apollo-module
  apollo: {
    clientConfigs: {
      // authenticationType: '',
      default: {
        httpEndpoint: 'http://127.0.0.1:7001/graphql'
      }
    }
  },
  modules: [
    ['@nuxtjs/apollo'],
    ['@nuxtjs/axios'],
    [
      '@nuxtjs/dotenv',
      {
        path: './'
      }
    ]
  ],
  axios
}

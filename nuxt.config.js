import webpack from 'webpack';
import sfccConfig from './middleware.config';
import StringReplacePlugin from 'string-replace-webpack-plugin';

export default {
  mode: 'universal',
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  head: {
    title: 'Vue Storefront',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'crossorigin'
      },
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css?family=Raleway:300,400,400i,500,600,700|Roboto:300,300i,400,400i,500,700&display=swap',
        as: 'style'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Raleway:300,400,400i,500,600,700|Roboto:300,300i,400,400i,500,700&display=swap',
        media: 'print',
        onload: 'this.media=\'all\'',
        once: true
      }
    ]
  },
  loading: { color: '#fff' },
  plugins: [],
  buildModules: [
    // to core
    '@nuxt/typescript-build',
    '@nuxtjs/style-resources',
    ['@vue-storefront/nuxt', {
      useRawSource: {
        dev: [
          '@vue-storefront/sfcc',
          '@vue-storefront/core'
        ],
        prod: [
          '@vue-storefront/sfcc',
          '@vue-storefront/core'
        ]
      }
    }],
    ['@vue-storefront/nuxt-theme'],
    ['@vue-storefront/sfcc/nuxt', sfccConfig.integrations.sfcc.configuration]
  ],
  modules: [
    'nuxt-i18n',
    'cookie-universal-nuxt',
    'vue-scrollto/nuxt',
    '@vue-storefront/middleware/nuxt'
  ],
  i18n: {
    locales: [
      { code: 'en' },
      { code: 'de' }
    ],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages: {
        en: {
          welcome: 'Welcome 1'
        },
        de: {
          welcome: 'Welcome 2'
        }
      }
    }
  },
  styleResources: {
    scss: [require.resolve('@storefront-ui/shared/styles/_helpers.scss', { paths: [process.cwd()] })]
  },
  build: {
    // TODO Handle these in theme files
    extend(config) {
      config.module.rules.push({
        test: /MyAccount\.vue$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /my-account-page_shipping-details/,
              replacement: () => 'my-account-page_address-details'
            },
            {
              pattern: /"Shipping details"/,
              replacement: () => '"Address details"'
            },
            {
              pattern: /<SfContentPage data-cy="my-account-page_billing-details" title="Billing details">\s+<BillingDetails \/>\s+<\/SfContentPage>/m,
              replacement: () => ''
            },
            {
              pattern: /import BillingDetails from '\.\/MyAccount\/BillingDetails';/,
              replacement: () => ''
            },
            {
              pattern: /BillingDetails,?/g,
              replacement: () => ''
            }
          ]
        })
      });

      config.module.rules.push({
        test: /ShippingDetails\.vue$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /UserShippingAddress/g,
              replacement: () => 'UserAddress'
            },
            {
              pattern: /ShippingAddressForm/g,
              replacement: () => 'AddressForm'
            }
          ]
        })
      });

      config.module.rules.push({
        test: /Product\.vue$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /\.\.\.filter/,
              replacement: () => '...Object.entries(filter).reduce((acc, [key, attr]) => ({ ...acc, [key]: attr.value || attr }), {})'
            },
            {
              pattern: /options\.color\.length > 1/,
              replacement: () => 'options.color.length > 0'
            }
          ]
        })
      });

      config.module.rules.push({
        test: /Category\.vue$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /addItemToWishlist,/,
              replacement: () => 'addItemToWishlist, removeItemFromWishlist, isInWishlist,'
            },
            {
              pattern: /{ addItem: addItemToWishlist }/,
              replacement: () => '{ addItem: addItemToWishlist, removeItem: removeItemFromWishlist, isInWishlist }'
            },
            {
              pattern: /:isInWishlist="false"/,
              replacement: () => ':isInWishlist="isInWishlist({ product })"'
            },
            {
              pattern: /@click:wishlist="addItemToWishlist\({ product }\)"/,
              replacement: () => '@click:wishlist="isInWishlist({ product }) ? removeItemFromWishlist({ product }) : addItemToWishlist({ product })"'
            }
          ]
        })
      });
    },
    babel: {
      plugins: [
        '@babel/plugin-proposal-optional-chaining'
      ]
    },
    transpile: [
      'vee-validate/dist/rules'
    ],
    plugins: [
      new StringReplacePlugin(),
      new webpack.DefinePlugin({
        'process.VERSION': JSON.stringify({
          // eslint-disable-next-line global-require
          version: require('./package.json').version,
          lastCommit: process.env.LAST_COMMIT || ''
        })
      })
    ]
  },
  router: {
    scrollBehavior (_to, _from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { x: 0, y: 0 };
      }
    }
  }
};

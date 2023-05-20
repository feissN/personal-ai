// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    css: ['~/assets/css/main.scss', '@fortawesome/fontawesome-svg-core/styles.css'
    ],
    runtimeConfig: {
        public: {
            devMode: false
        }
    }
})

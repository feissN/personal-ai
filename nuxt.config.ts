// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ["@pinia/nuxt"],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    css: ["~/assets/css/main.scss", "@fortawesome/fontawesome-svg-core/styles.css"],
    runtimeConfig: {
        pineconeIndexName: process.env.PINECONE_INDEX_NAME,
        pineconeApiKey: process.env.PINECONE_API_KEY,
        pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
        public: {
            devMode: false,
            locked: true,
        },
    },
});

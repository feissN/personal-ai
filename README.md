# Chat with your Documents using Nuxt3 + TypeScript + LangChain + Hnswlib + OpenAI
## Inspired and motivated by https://github.com/developersdigest/

## Preview
![image](https://user-images.githubusercontent.com/86616781/233838482-7c0b3979-5793-4d92-aa40-07a641e14d2d.png)

### Ingest own documents
1. Create folder `docs` in `server/` and place all your .pdf files there
2. Run `npm run dev` to start the dev-server. On the first startup it will check if `docs` exists. If so, it will then create the vectors for those files. You can then start asking some questions


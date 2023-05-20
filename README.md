# Chat with your Documents using Nuxt3 + TypeScript + LangChain + Hnswlib + OpenAI
## Inspired and motivated by https://github.com/developersdigest/ and https://github.com/mayooear/

## Preview
![image](https://user-images.githubusercontent.com/86616781/233838482-7c0b3979-5793-4d92-aa40-07a641e14d2d.png)

## Setup
1. Run `npm install`
2. Create `.env` with `OPENAI_API_KEY=YOURAPIKEY`
3. Ingest own documents
    1. Create folder `docs` in `server/` and place all your .pdf files there
    2. Run `npm run ingest` to ingest the new docs into the vector store
4. Start the dev-Server
   1. Run `npm run dev`. On the first startup it will check if `docs` exists. If so, everything is fine and you can start chatting


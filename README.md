# Chat with your Documents using Nuxt3 + TypeScript + LangChain + Hnswlib + OpenAI
## Inspired and motivated by https://github.com/developersdigest/ and https://github.com/mayooear/

## Preview
![image](![image](https://github.com/feissN/personal-ai/assets/86616781/73747291-5ced-4674-806b-16f496bf683c))

## Setup
1. Run `npm install`
2. Create `.env` with `OPENAI_API_KEY=YOURAPIKEY`
3. Ingest own documents
    1. Create folder `docs` in `server/` and place all your .pdf files there
    2. Run `npm run ingest` to ingest the new docs into the vector store
4. Start the dev-Server
   1. Run `npm run dev`. On the first startup it will check if `docs` exists. If so, everything is fine and you can start chatting


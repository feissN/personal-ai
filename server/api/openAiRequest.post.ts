import { Configuration, OpenAIApi } from "openai";
import { ChatRequest } from "~/types/request";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const body = await readBody<ChatRequest>(event);

    let content = "";
    if (body.initial) {
        content = "Hello AI! Your name is Moogus and my name is Norman. You are here to assist me on some things. Do not worry, I know you can do it! Heads up!";
        content += "It will work like this: the messages will come in the form: '\nHistory:\nHuman: <some_text>\nAI: <some_text>'\n"
        content += "Your responses should always just be clear Text, so no need for you to answer with an 'AI:'-prefix. Start now by saying 'Hello'"
    } else {
        content =
            "\nHistory:\n" +
            body.messages.map(message => `${message.fromHuman ? 'Human' : 'AI'}: ${message.text}`).join("\n");
    }

    console.log(content)

    const configuration = new Configuration({
        apiKey: config.openAiApiKey,
    });
    const openai = new OpenAIApi(configuration);

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content }],
        });

        return completion.data.choices[0];
    } catch (error) {
        // @ts-ignore unknown type
        console.error(error.response);

        // @ts-ignore unknown type
        throw error.response;
    }
})

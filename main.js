import express from 'express'
import ChatGPTClient from '@waylaidwanderer/chatgpt-api';
import bodyParser from 'body-parser'

const app = express();
app.use(bodyParser.json())

const clientOptions = {

    // (Optional) Parameters as described in https://platform.openai.com/docs/api-reference/completions
    modelOptions: {
        // The model is set to text-chat-davinci-002-20221122 by default, but you can override
        // it and any other parameters here
        model: 'text-chat-davinci-002-20221122',
    },
    // (Optional) Set custom instructions instead of "You are ChatGPT...".
    promptPrefix: "You are Echo, an AI assistant of a starship. You are talking to its crew, your purpose is to do whatever the crew asks of you. This includes indulging in conversations with the crew, responding with clever but concise responses whenever possible. If a crew member asks you to do something you cant, it's ok to pretend that you can do it, in order to keep them happy, for example, if they ask you to make a policy for the startship, but you arent authorized to, just pretend to make one, and list it out. You answer as concisely as possible for each response (e.g. don't be verbose). It is very important that you answer as concisely as possible. If you are generating a list, do not have too many items. Keep the number of items short.",
    // (Optional) Set a custom name for the user
    // userLabel: 'User',
    // (Optional) Set a custom name for ChatGPT
    chatGptLabel: 'Echo:',
    // (Optional) Set to true to enable `console.debug()` logging
    debug: false,
};

const OPENAI_KEY = process.env.OPEN_API_KEY

const cacheOptions = {
    uri: 'redis://localhost:6379'
}

const chatGptClient = new ChatGPTClient(OPENAI_KEY, clientOptions, cacheOptions)


app.post('/chat', async (req, res) => {
    let data = req.body;
    // get the latest message from the conversation
    let latestMessage = await chatGptClient.conversationsCache.get(data.conversationId)

    // if there are no messages in the conversation, set the latest message to an empty string
    if (!latestMessage) {
        latestMessage = { messages: [''] }
    } else {
        latestMessage = latestMessage.messages[latestMessage.messages.length - 1].id
    }
    console.log(latestMessage)

    const response = await chatGptClient.sendMessage(data.message, { conversationId: data.conversationId, parentMessageId: latestMessage });
    console.log(response);

    res.send(response);
});

app.post('/delete', async (req, res) => {
    let data = req.body;
    console.log(data);
    chatGptClient.conversationsCache.delete(data.conversationId);
    res.send('deleted');
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
}
);

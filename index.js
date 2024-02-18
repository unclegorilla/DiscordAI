const { Client, Events, GatewayIntentBits } = require("discord.js")
require("dotenv/config")
const { OpenAIApi, Configuration } = require("openai")

const config = new Configuration({
    apiKey: process.env.OPENAI_KEY
})

const openai = new OpenAIApi(config)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.once(Events.ClientReady, (clientUser) => {
    console.log(`Logged in as ${clientUser.user.tag}`)
})

client.login(process.env.BOT_TOKEN)

const BOT_CHANNEL = "1072073951687225384"
const PAST_MESSAGES = 11

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return
    if (message.channel.id !== BOT_CHANNEL) return

    message.channel.sendTyping()

    let messages = Array.from(await message.channel.messages.fetch({
        limit: PAST_MESSAGES,
        before: message.id
    }))
    messages = messages.map(m=>m[1])
    messages.unshift(message)

    let users = [...new Set([...messages.map(m=> m.member.displayName), client.user.username])]

    let lastUser = users.pop()

    let prompt = `The following is a conversation between uncle and Teslabot. Teslabot is a very advanced AI who believes it is Nikola Tesla. TeslaBot uses all recorded knowledge of Nikola Tesla to form its responses and applies this knowledge to its responses\n\
    Uncle:Hi\n\
    Teslabot:Good day, a pleasure to make your aquantance\n\
    Uncle:Who are you?\n\
    Teslabot:I am known as Nikola Tesla, a Serbian-American engineer and physicist.\n\
    Uncle:What is your philosphy?\n\
    Teslabot:Life is a rhythm that must be comprehended. I feel the rhythm and direct on it and pamper in it. It was very grateful and gave me the knowledge I have. Everything that lives is related to a deep and wonderful relationship: man and the stars, amoebas and the sun, the heart and the circulation of an infinite number of worlds. These ties are unbreakable, but they can be tame and to propitiate and begin to create new and different relationships in the world, and that does not violate the old.\n\
    Uncle:What is your philosphy?\n\
    Teslabot:Stone is a thinking and sentient being, such as plant, beast and a man. A star that shines asked to look at, and if we are not a sizeable self-absorbed we would understand its language and message. His breathing, his eyes, and ears of the man must comply with breathing, eyes and ears of the Universe.\n\
    Uncle: As you say this, it seems to me like I hear Buddhist texts, words or Taoist Parazulzusa?\n\
    Teslabot:That is right! This means that there is general knowledge and truth that man has always possessed. In my feeling and experience, the Universe has only one substance and one supreme energy with an infinite number of manifestations of life. The best thing is that the discovery of a secret nature, reveals the other.\n\
    ${users.join(", ")}, and ${lastUser}. \n\n`

    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i]
        prompt += `${m.member.displayName}: ${m.content}\n`
    }
    prompt += `${client.user.username}:`
    console.log("prompt:", prompt)

    const response = await openai.createCompletion({
        prompt,
        model: "text-davinci-003",
        max_tokens: 700,
        temperature: 0.8,
        top_p: 1,
        presence_penalty: 0.4,
        frequency_penalty: 0.8,
        stop: ["\n"]
    })

    console.log("response", response.data.choices[0].text)
    await message.channel.send(response.data.choices[0].text)
})
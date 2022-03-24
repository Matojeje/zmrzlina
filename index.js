require('dotenv').config()
const Slimbot = require("slimbot")
const bot = new Slimbot(process.env.token)

const axios = require("axios")
const cheerio = require("cheerio")

const today = new Date().getDay()

console.log("Ready")

bot.on("message", message => {
    console.log(message)
    bot.sendMessage(process.env.logChannelID, `Got new message from ${message.from.first_name} (@${message.from.username}):\n${message.text}`)
    bot.sendMessage(message.chat.id, "https://t.me/zmrzlinastarnov")
})

pageParse()

bot.startPolling()

async function pageParse() {
    const response = await axios.get("http://zmrzlina.zmrzlina-starnov.cz/provozni-doba/index.html")
    console.log(`${response?.status} ${response?.statusText}`)
    if (response?.status != 200) {
        bot.sendMessage(process.env.logChannelID, `Error with getting the webpage: ${response?.status} ${response?.statusText}`)
        return
    }

    const page = cheerio.load(response.data)
    function text(selector) { return page(selector).text().trim() }

    const isOpen = text(".panel2_middle") == "ZAVŘENO"
    const openHours = text("#telo_middle > ul:nth-child(4)").split("\n")

    if (isOpen) {
        console.log("Store closed")
        bot.sendMessage("@zmrzlinastarnov", "Dnes je zavřeno.")
    } else {
        bot.sendMessage("@zmrzlinastarnov", "Dnes je otevřeno.\nOtevírací doba: " + openHours[today == 0 || today == 6 ? 1 : 0].split(":")[1].trim() )
        bot.sendMessage(process.env.logChannelID, "Uh oh we're open!!")
    }
}
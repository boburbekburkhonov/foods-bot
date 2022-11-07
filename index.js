import express from 'express'
import dotenv from 'dotenv'
import TelegramBot from "node-telegram-bot-api";
import keyboards from "./keyboards/keyboards.js";
import { read, write } from "./utils/fs.js";

dotenv.config()

const app = express();

app.use(express.json())

const bot = new TelegramBot(process.env.TOKEN, {
  polling: true
})

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, `Salom ${msg.chat.first_name == undefined ? msg.from.first_name : msg.chat.first_name}`, {
    reply_markup:{
      keyboard: keyboards.menu,
      resize_keyboard: true
    }
  })
})

bot.on('message', msg => {
  if(msg.text == 'Bizning Menyu'){
    bot.sendMessage(msg.chat.id, 'Bizning Menyu', {
      reply_markup: {
        keyboard: keyboards.meals,
        resize_keyboard: true
      }
    })
  }

  if(msg.text == 'Asosiy menyu🔙'){
    bot.sendMessage(msg.chat.id, 'Asosiy menyu',{
      reply_markup:{
        keyboard:keyboards.menu,
        resize_keyboard:true
      }
    })
  }

  const allMeals = read('meals.json').find(e => e.name == msg.text)

  if(allMeals){
    bot.sendPhoto(msg.chat.id, allMeals.imgUrl, {
      caption: `
        ${allMeals.desc}\n<span class="tg-spoiler">${allMeals.price}</span>
      `,
      parse_mode: 'HTML',
      reply_markup:{
        inline_keyboard: [
            [
              {
              text:'Registratsiya qiling',
              callback_data: `${allMeals.name}`
              }
            ]
        ]
      }
    })
  }

})

bot.on('callback_query', async msg => {
  if(msg.data){
    const userContact = await bot.sendMessage(msg.message.chat.id, 'Kontaktingizni kiriting', {
      reply_markup: JSON.stringify({
        keyboard: [
          [{
            text: 'Kontaktni kiritish📞',
            request_contact: true
          }],
          [{
            text: 'Asosiy menyu🔙'
          }]
        ],
        resize_keyboard: true
      })
    })

    bot.onReplyToMessage(userContact.chat.id, userContact.message_id, async usercontact => {
      const allRequests = read('requests.json');

      allRequests.push({
        id: allRequests.at(-1)?.id + 1 || 1,
        from: usercontact.from.first_name,
        phone:usercontact.contact.phone_number,
        food: msg.data
      })

      const newAllRequests = await write('requests.json', allRequests)

      if(newAllRequests){
        bot.sendMessage(usercontact.chat.id, 'Zakazingiz muvaffaqqiyatli qabul qilindi!',{
          reply_markup:{
            keyboard:keyboards.menu,
            resize_keyboard: true
          }
        })
      }
    })
  }
})

app.get('/foods', (req, res) => res.json(read('meals.json')))

app.post('/newFood', async (req, res) => {
  const { name, imgUrl, desc, price} = req.body;

  const allMeals = read('meals.json');

  allMeals.push({
    id: allMeals.at(-1)?.id + 1 || 1,
    name,
    imgUrl: imgUrl ? imgUrl : 'https://firebasestorage.googleapis.com/v0/b/images-5c23a.appspot.com/o/shaurma.png?alt=media&token=5a6983b2-0ffd-4c63-ab70-c1d5e112f290',
    desc, price
  })

  await write('meals.json', allMeals)

  res.send("OK")
})

app.listen(process.env.PORT ?? 9090, console.log(process.env.PORT ?? 9090))

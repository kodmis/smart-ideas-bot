const fetch = require('node-fetch');
function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const IDEAS_API_URL = `http://api.forismatic.com/api/1.0/?method=getQuote&format=json&key=${getRandomInRange(1, 999999)}&lang=ru`;
const DONATE_URL = 'https://yasobe.ru/na/mudry_mysli';
const DONATE_IMG_URL = 'https://storage.yandexcloud.net/bot-images/bot-good-ideas/donate.PNG';

async function getExpression() {
  try {
    const data = await fetch(IDEAS_API_URL);
    const json = await data.json();
    const quote = json.quoteText;
    const author = json.quoteAuthor.length === 0 ? 'Автор не известен' : json.quoteAuthor;
    return `<b>${quote}</b>\n\u2014 <i>${author}</i>`;
  } catch (err) {
    console.error('Fail to fetch data: ' + err);
    return 'Мысль потеряна! Попробуй ещё раз.';
  }
}

function isKeyWordInMessage(str) {
  const triggerWords = ['мысль', 'мысли', 'цитата', 'цитату', 'цитируй', 'процитируй', 'цитаты', 'цитирует',
    'цитировать', 'процитирует', 'процитировать', 'изречение', 'изречения', 'мудрость', 'мудрости', 'мудрые',
    'мудрую', 'мудрое', 'высказывание', 'высказывания'];
  for (let item of triggerWords) {
    if (str.toLowerCase().includes(item)) {
      return true;
    }
  }
  return false;
}

function generateBotMessage (messageText, chatID, replyKeyboard) {
    return {
        'method': 'sendMessage',
        'parse_mode': 'HTML',
        'chat_id': chatID,
        'text': messageText,
        'reply_markup': replyKeyboard
    };
}

function generateBotPhoto (photoUrl, chatID, link) {

    return {
        'method': 'sendPhoto',
        'photo': photoUrl,
        'chat_id': chatID,
        'reply_markup': JSON.stringify({
          inline_keyboard: [
            [{ text: link.text, url: link.url }]
          ]
        })
      };
}
async function SmartIdeasBot (httpRequest) 
{
  const telegramRequest = JSON.parse(httpRequest.body);
  const userMessage = telegramRequest.message.text.toLowerCase();
  const fastInputButtons = JSON.stringify({
    keyboard: [
      [{ text: 'Умная мысль' }],
      [{ text: 'Кинуть монетку' }]
    ]
    });
  const donateLink = { text: 'Проспонсируй немного Мудрые Мысли!', url: DONATE_URL }
  let botMessage = '';
  let telegramsResponse = {};
  let httpResponse = {};

  if (isKeyWordInMessage(userMessage)) {
    botMessage = await getExpression();
    telegramsResponse = generateBotMessage(botMessage, telegramRequest.message.chat.id, fastInputButtons);
  
  } else if (userMessage === 'кинуть монетку') {
    telegramsResponse = generateBotPhoto(DONATE_IMG_URL, telegramRequest.message.chat.id, donateLink);
  
  } else if (userMessage === '/start') {
    botMessage = 'Нажми на кнопку "Умная мысль", чтобы получить её бесплатно.';
    telegramsResponse = generateBotMessage(botMessage, telegramRequest.message.chat.id, fastInputButtons);

  } else if (userMessage === '/help') {
    botMessage = 'Я поставляю умные мысли от умных людей! Нажимай на кнопку "Умная мысль", чтобы получать их бесплатно.';
    telegramsResponse = generateBotMessage(botMessage, telegramRequest.message.chat.id, fastInputButtons);
  
  } else {
    botMessage = 'Давай не будем отвлекаться. Просто нажимай кнопку "Умная мысль", и получай эти мысли бесплатно.';
    telegramsResponse = generateBotMessage(botMessage, telegramRequest.message.chat.id, fastInputButtons);
  }
  
  httpResponse = {
    'statusCode': 200,
    'headers': {
      'Content-Type': 'application/json; charset=utf-8'
    },
    'body': JSON.stringify(telegramsResponse),
    'isBase64Encoded': false
  };

  return httpResponse
};

module.exports.bot = SmartIdeasBot;
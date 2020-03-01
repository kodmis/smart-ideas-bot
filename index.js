const fetch = require('node-fetch');
const { random, includes } = require('lodash');
const IDEAS_API_URL = `http://api.forismatic.com/api/1.0/?method=getQuote&format=json&key=${random(1, 999999)}&lang=ru`;

// Определение функции получения данных и возврат отформатированной цитаты:
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
    if (includes(str, item.toLowerCase())) {
      return true;
    }
  }
  return false;
}


async function SmartIdeasBot (httpRequest) 
{
  const telegramRequest = JSON.parse(httpRequest.body);
  const userMessage = telegramRequest.message.text.toLowerCase();
  const fastInputButtons = JSON.stringify({
    keyboard: [
      [{ text: 'Умная мысль' }],
      [{ text: 'Навык Алисы' }],
      [{ text: 'Кинуть монетку' }]
    ]
    });

  let botMessage = '';
  let telegramsResponse = {};
  let httpResponse = {};

  if (isKeyWordInMessage(userMessage)) {
    botMessage = await getExpression();
  } else if (userMessage === '/start') {
    botMessage = 'Нажми на кнопку "Умная мысль", чтобы получить её бесплатно.';
  } else if (userMessage === '/help') {
    botMessage = 'Я поставляю умные мысли от умных людей! Нажимай на кнопку "Умная мысль", чтобы получать их бесплатно.';
  } else {
    botMessage = 'Давай не будем отвлекаться. Просто нажимай кнопку "Умная мысль", и получай эти мысли бесплатно.';
  }
  
  telegramsResponse = {
      'method': 'sendMessage',
      'parse_mode': 'HTML',
      'chat_id': telegramRequest.message.chat.id,
      'text': botMessage,
      'reply_markup': fastInputButtons
  };
  
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
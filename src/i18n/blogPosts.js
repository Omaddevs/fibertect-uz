// Blog maqolalari matni. Rasm, sana va manzil content.js dagi `blogPosts` da, tartibi bir xil.
// Har bir bo'lim: `h` sarlavha, `p` xatboshilar, `list` ixtiyoriy ro'yxat.
// O'zbekcha matnlar yangi alifboda: g‘ → ğ, o‘ → ö, sh → ş, ch → ç.
export const blogPostTexts = {
  uz: [
    {
      category: 'Veb-saytlar',
      title: 'Landing sahifa yoki korporativ sayt: biznesingizga qaysi biri kerak?',
      excerpt: 'Ikkalasi ham sayt, lekin vazifasi har xil. Töğri tanlov byudjetni tejaydi va natijani tezroq beradi.',
      sections: [
        {
          h: 'Landing sahifa nima uçun kerak',
          p: [
            'Landing bitta maqsadga qurilgan bitta sahifa: murojaat yiğiş, mahsulotni taqdim etiş yoki reklama kampaniyasini qöllab-quvvatlaş. Foydalanuvçi boşqa bölimlarga çalğimaydi, butun sahifa uni bitta harakatga olib boradi.',
            'U yangi mahsulotni sinab körmoqçi bölgan yoki reklama orqali mijoz jalb qilayotgan biznesga mos keladi. Tez tayyorlanadi, natijasini ölçaş esa oson.',
          ],
        },
        {
          h: 'Korporativ sayt qaçon kerak',
          p: [
            'Korporativ sayt kompaniyaning töliq vakili: xizmatlar, jamoa, loyihalar, yangiliklar va aloqa ma’lumotlari bir joyda turadi. Hamkor yoki yirik mijoz sizni tekşirayotganda aynan şu ma’lumotlarni qidiradi.',
            'Agar xizmatlaringiz köp bölsa, ma’lumotlar tez-tez yangilansa yoki sayt bir neça tilda kerak bölsa, bitta sahifa yetmaydi.',
          ],
        },
        {
          h: 'Tanlaş uçun uçta savol',
          p: ['Qaror qabul qilişdan oldin şu savollarga javob bering:'],
          list: [
            'Saytdan bitta aniq natija kutyapsizmi yoki kompaniyani töliq taqdim etmoqçimisiz?',
            'Taklifingiz bitta mahsulotmi yoki bir neça xizmat?',
            'Mazmunni kim va qanday tez-tezlikda yangilab turadi?',
          ],
        },
        {
          h: 'Bittadan boşlab, keyin kengaytiriş mumkin',
          p: [
            'Tanlov bir umrga emas. Köp kompaniyalar landingdan boşlaydi, talab tasdiqlangaç esa uni töliq saytga kengaytiradi. Muhimi, boşidanoq keyingi qadamni hisobga olib qurilgan bölsin.',
          ],
        },
      ],
    },
    {
      category: 'Maslahat',
      title: 'Sayt buyurtma berişdan oldin tayyorlab qöyiladigan 6 narsa',
      excerpt: 'Yaxşi tayyorgarlik loyihani tezlaştiradi, ortiqça tuzatişlarni kamaytiradi va narxni aniqroq hisoblaşga yordam beradi.',
      sections: [
        {
          h: 'Nega tayyorgarlik muhim',
          p: [
            'Jamoa sizning biznesingizni siz kabi bilmaydi. Loyiha boşida qançalik aniq ma’lumot berilsa, narx va muddat şunçalik aniq böladi, keyingi tuzatişlar esa kamayadi. Quyidagilarni mukammal bölmasa ham, taxminiy tayyorlab qöyiş kifoya.',
          ],
        },
        {
          h: 'Tayyorlab qöyiladigan röyxat',
          p: [],
          list: [
            'Maqsad: sayt nima qilişi kerak? Masalan, murojaat yiğiş, onlayn sotiş yoki kompaniyani tanitiş.',
            'Auditoriya: saytdan kim foydalanadi va ular eng avval nimani qidiradi?',
            'Namunalar: sizga yoqqan 2–3 ta sayt va ularda aynan nima yoqqani.',
            'Mazmun: matnlar, rasmlar, logotip va xizmatlar röyxati. Tayyor bölmaganini oldindan ayting.',
            'Texnik ma’lumotlar: domen va hosting bormi, qaysi tizimlar bilan boğlaş kerak?',
            'Muddat va byudjet: qaçongaça kerakligi va qançaga mölljallanganingiz.',
          ],
        },
        {
          h: 'Hammasi tayyor bölmasa-çi',
          p: [
            'Bu odatiy hol. Röyxatning bir qismini loyiha davomida birga aniqlaş mumkin. Muhimi, nima tayyor va nima tayyor emasligini boşidanoq ayting: reja şunga qarab tuziladi.',
          ],
        },
      ],
    },
    {
      category: 'Telegram botlar',
      title: 'Biznes uçun Telegram bot: qaçon foydali, qaçon ortiqça',
      excerpt: 'Bot takrorlanadigan işni öz zimmasiga oladi, lekin har qanday muammoning yeçimi emas. Qaysi holatda kerakligini körib çiqamiz.',
      sections: [
        {
          h: 'Bot nimalarni yaxşi bajaradi',
          p: ['Bot bir xil tartibda takrorlanadigan vazifalarda eng foydali:'],
          list: [
            'Buyurtma va murojaatlarni qabul qiliş.',
            'Köp beriladigan savollarga javob beriş.',
            'Holat va eslatmalarni yuboriş.',
            'Xodimlarga yangi murojaat haqida darhol xabar beriş.',
          ],
        },
        {
          h: 'Qaçon ortiqça böladi',
          p: [
            'Agar murojaatlar kam bölsa yoki har bir mijoz bilan alohida kelişuv kerak bölsa, odam javob bergani yaxşiroq. Bot sotuv va maslahat suhbatini töliq almaştirmaydi, u faqat ularga tayyorlaydi.',
          ],
        },
        {
          h: 'Bot, sayt yoki ilova',
          p: [
            'Mijozlaringiz Telegramda faol bölsa, bot boşlaş uçun qulay yöl: alohida ilova örnatiş kerak emas, foydalaniş ham oddiy. Murakkab katalog yoki katta jadvallar uçun esa sayt yoki veb-ilova qulayroq.',
          ],
        },
        {
          h: 'Kiçikdan boşlang',
          p: [
            'Eng köp vaqt oladigan bitta jarayonni tanlang va botni avval şu vazifaga moslang. Foydasi körinsa, keyingi vazifalarni qöşiş oson böladi.',
          ],
        },
      ],
    },
  ],

  ru: [
    {
      category: 'Веб-сайты',
      title: 'Лендинг или корпоративный сайт: что нужно вашему бизнесу?',
      excerpt: 'И то и другое — сайт, но задачи у них разные. Правильный выбор экономит бюджет и быстрее даёт результат.',
      sections: [
        {
          h: 'Зачем нужен лендинг',
          p: [
            'Лендинг — это одна страница с одной целью: собрать заявки, представить продукт или поддержать рекламную кампанию. Посетителя ничего не отвлекает, и вся страница ведёт его к одному действию.',
            'Он подходит бизнесу, который хочет проверить новый продукт или привлекает клиентов через рекламу. Его быстро делать, а результат легко измерить.',
          ],
        },
        {
          h: 'Когда нужен корпоративный сайт',
          p: [
            'Корпоративный сайт полноценно представляет компанию: услуги, команда, проекты, новости и контакты собраны в одном месте. Именно это ищут партнёры и крупные клиенты, когда проверяют вас.',
            'Если услуг много, информация часто обновляется или сайт нужен на нескольких языках, одной страницы будет мало.',
          ],
        },
        {
          h: 'Три вопроса для выбора',
          p: ['Прежде чем решать, ответьте на эти вопросы:'],
          list: [
            'Вы ждёте от сайта один конкретный результат или хотите полностью представить компанию?',
            'Ваше предложение — это один продукт или несколько услуг?',
            'Кто и как часто будет обновлять содержимое?',
          ],
        },
        {
          h: 'Можно начать с одного и расшириться позже',
          p: [
            'Выбор не навсегда. Многие компании начинают с лендинга, а когда спрос подтверждается, расширяют его до полноценного сайта. Важно, чтобы следующий шаг был учтён с самого начала.',
          ],
        },
      ],
    },
    {
      category: 'Советы',
      title: '6 вещей, которые стоит подготовить перед заказом сайта',
      excerpt: 'Хорошая подготовка ускоряет проект, сокращает лишние правки и помогает точнее рассчитать стоимость.',
      sections: [
        {
          h: 'Почему важна подготовка',
          p: [
            'Команда не знает ваш бизнес так, как знаете его вы. Чем точнее информация в начале проекта, тем точнее стоимость и сроки и тем меньше правок потом. Не обязательно готовить всё идеально, достаточно примерных ответов.',
          ],
        },
        {
          h: 'Что подготовить',
          p: [],
          list: [
            'Цель: что должен делать сайт? Например, собирать заявки, продавать онлайн или рассказывать о компании.',
            'Аудитория: кто будет пользоваться сайтом и что эти люди ищут в первую очередь?',
            'Примеры: 2–3 сайта, которые вам нравятся, и что именно в них нравится.',
            'Содержимое: тексты, изображения, логотип и список услуг. О том, что ещё не готово, лучше сказать заранее.',
            'Технические данные: есть ли домен и хостинг, с какими системами нужна интеграция?',
            'Сроки и бюджет: к какой дате нужен сайт и на какую сумму вы рассчитываете.',
          ],
        },
        {
          h: 'Что, если готово не всё',
          p: [
            'Это нормально. Часть списка можно уточнить вместе в ходе проекта. Главное — сразу сказать, что готово, а что нет: от этого зависит план работы.',
          ],
        },
      ],
    },
    {
      category: 'Telegram-боты',
      title: 'Telegram-бот для бизнеса: когда он полезен, а когда лишний',
      excerpt: 'Бот берёт на себя повторяющуюся работу, но решает не все задачи. Разберём, в каких случаях он действительно нужен.',
      sections: [
        {
          h: 'Что бот делает хорошо',
          p: ['Больше всего пользы бот приносит в задачах, которые повторяются по одному сценарию:'],
          list: [
            'Приём заказов и обращений.',
            'Ответы на частые вопросы.',
            'Отправка статусов и напоминаний.',
            'Мгновенные уведомления сотрудникам о новых обращениях.',
          ],
        },
        {
          h: 'Когда бот лишний',
          p: [
            'Если обращений мало или с каждым клиентом нужна отдельная договорённость, лучше, чтобы отвечал человек. Бот не заменяет продажи и консультации полностью, он лишь готовит к ним.',
          ],
        },
        {
          h: 'Бот, сайт или приложение',
          p: [
            'Если ваши клиенты активны в Telegram, бот — удобный способ начать: не нужно устанавливать отдельное приложение, и пользоваться им просто. Для сложного каталога или больших таблиц удобнее сайт или веб-приложение.',
          ],
        },
        {
          h: 'Начните с малого',
          p: [
            'Выберите один процесс, который отнимает больше всего времени, и сначала настройте бота под него. Когда польза станет заметна, добавлять новые задачи будет легко.',
          ],
        },
      ],
    },
  ],

  en: [
    {
      category: 'Websites',
      title: 'Landing page or corporate website: which does your business need?',
      excerpt: 'Both are websites, but they do different jobs. The right choice saves budget and brings results sooner.',
      sections: [
        {
          h: 'What a landing page is for',
          p: [
            'A landing page is a single page built around a single goal: collecting enquiries, presenting a product or supporting an ad campaign. Nothing distracts the visitor, and the whole page leads to one action.',
            'It suits a business testing a new product or attracting customers through advertising. It is quick to build, and its results are easy to measure.',
          ],
        },
        {
          h: 'When you need a corporate website',
          p: [
            'A corporate website represents the whole company: services, team, projects, news and contact details in one place. This is what partners and larger clients look for when they check you out.',
            'If you offer many services, update information often or need several languages, one page will not be enough.',
          ],
        },
        {
          h: 'Three questions to help you choose',
          p: ['Before you decide, answer these questions:'],
          list: [
            'Do you want one specific result from the site, or do you want to present the whole company?',
            'Is your offer one product or several services?',
            'Who will update the content, and how often?',
          ],
        },
        {
          h: 'You can start with one and expand later',
          p: [
            'The choice is not permanent. Many companies start with a landing page and expand it into a full website once demand is proven. What matters is planning for that next step from the start.',
          ],
        },
      ],
    },
    {
      category: 'Advice',
      title: '6 things to prepare before ordering a website',
      excerpt: 'Good preparation speeds up the project, reduces unnecessary revisions and helps estimate the cost more accurately.',
      sections: [
        {
          h: 'Why preparation matters',
          p: [
            'A development team does not know your business the way you do. The clearer the information at the start, the more accurate the price and timeline, and the fewer revisions later. Rough answers are enough; nothing has to be perfect.',
          ],
        },
        {
          h: 'What to prepare',
          p: [],
          list: [
            'Goal: what should the site do? For example, collect enquiries, sell online or introduce the company.',
            'Audience: who will use the site, and what do they look for first?',
            'Examples: 2–3 websites you like, and what exactly you like about them.',
            'Content: texts, images, logo and a list of services. Say early on if something is not ready.',
            'Technical details: do you have a domain and hosting, and which systems need to be connected?',
            'Timeline and budget: when you need the site and how much you plan to spend.',
          ],
        },
        {
          h: 'What if not everything is ready',
          p: [
            'That is normal. Part of the list can be worked out together during the project. Just say from the start what is ready and what is not, because the plan depends on it.',
          ],
        },
      ],
    },
    {
      category: 'Telegram bots',
      title: 'A Telegram bot for business: when it helps and when it does not',
      excerpt: 'A bot takes over repetitive work, but it does not solve every problem. Here is when you actually need one.',
      sections: [
        {
          h: 'What a bot does well',
          p: ['A bot is most useful for tasks that repeat in the same way every time:'],
          list: [
            'Taking orders and enquiries.',
            'Answering frequently asked questions.',
            'Sending status updates and reminders.',
            'Notifying staff of new enquiries right away.',
          ],
        },
        {
          h: 'When a bot is unnecessary',
          p: [
            'If you get few enquiries, or each client needs an individual arrangement, it is better for a person to reply. A bot does not fully replace sales or consulting conversations; it only prepares for them.',
          ],
        },
        {
          h: 'Bot, website or app',
          p: [
            'If your customers are active on Telegram, a bot is a convenient way to start: there is no separate app to install, and it is simple to use. For a complex catalogue or large tables, a website or web app works better.',
          ],
        },
        {
          h: 'Start small',
          p: [
            'Pick the one process that takes the most time and set the bot up for that first. Once the benefit is clear, adding more tasks is easy.',
          ],
        },
      ],
    },
  ],
}

const CW = chrome.windows;
const CR = chrome.runtime;
const CSL = chrome.storage.local;
const CN = chrome.notifications;

const NOTIF_OPT = {
    priority: 2,
    silent: true,
    contextMessage: 'HWM ArcoBot'
}

const INIT = {
    default_active: true,       // включение бота
    default_goldcard: false,    // автопокупка золотых карт
    default_ktype: 1,           // тип колоды
    default_bet: -1,            // ставка
    default_autocreate: false,  // автоматическое создание партии
    default_return: true,       // возвращение в таверну после игры
    default_info: false,        // показывать условия игры
    default_stats: false,       // показывать статистику игроков

    default_key: null,
    default_joingame: false,    // вступать в заявку
    default_plist: [],          // массив игроков
    default_critpoint: 'auto',  // тревожная точка
    default_towersize: 30,      // высота башни противника
    default_manaval: 16,        // значение маны противника
    default_oreval: 16,         // значение руды противника

    userGK: 0,                  // ГК текущего игрока
    userID: "default",          // id текущего игрока - для записи настроек и т.п.
    userNAME: null,             // ник текущего игрока
    login: false
}

// Теневая загрузка страниц
const loadPage = async url => {
    try { return new TextDecoder('windows-1251').decode(new DataView(await (await fetch(url)).arrayBuffer())); } catch (e) { }
}

CR.onUpdateAvailable.addListener(details => {
    console.log(details.version);
});


// Обновление и первая установка расширения
CR.onInstalled.addListener(details => {
    if (details.reason == CR.OnInstalledReason.UPDATE) setTimeout(() => {

        Reset();
        /*
            Здесь можно вносить изменения после обновления, изменение пользовательских параметров и т.п.
        */
        CN.create('update', {
            type: 'basic',
            iconUrl: 'icon_128.png',
            title: `Установлено обновление ${CR.getManifest().version} >>`,
            message: '',
            requireInteraction: true,
            ...NOTIF_OPT
        });
    }, 1000);
    // Инициализируем настройки при установке расширения
    if (details.reason == CR.OnInstalledReason.INSTALL) CSL.set(INIT);
});


// Убираем все уведомления, если закрывается последнее окно браузера
CW.onRemoved.addListener(() => CW.getAll(windows => {
    if (windows.length == 0) Reset();
}));

// Сброс на дефолтные настройки при включении расширения
chrome.management.onEnabled.addListener(_ => Reset());


// обработка сообщений
CR.onMessage.addListener(async (request, sender, response) => {

    response(true);

    const storage = await CSL.get();
    const userID = storage.userID;

    if (request.login && !storage.login) {

        chrome.action.setIcon({ path: 'icon_on.png' });

        const page = await loadPage(`${sender.origin}/pl_info.php?id=${userID}`);
        const userNAME = /<title>([\wа-яё\-\(\) ]+) \|/i.exec(page)[1]; // никнейм игрока
        const userGK = +/Картежников: (\d+)/.exec(page)[1]; // уровень ГК

        CN.create('login', {
            type: 'basic',
            iconUrl: 'icon_128.png',
            title: 'Расширение активировано',
            message: `Текущий пользователь: ${userNAME}`,
            ...NOTIF_OPT
        });

        if (storage[userID + "_key"] && checkKey(storage[userID + "_key"], userID, userNAME) == false) CSL.set({ [userID + "_key"]: null }); // проверка на случай фиктивного ключа

        CSL.set({ userNAME, userGK, login: true });
    }

    // Разлогинился
    if (request.logout) {
        Reset();
    }

    // Проверка лицензионного ключа
    if (request.verifykey) {

        if (checkKey(request.verifykey, userID, storage.userNAME)) {

            CSL.set({ [userID + "_key"]: request.verifykey });
            CR.sendMessage({ 'popup': 'keyaccept' });

        } else {
            CR.sendMessage({ 'popup': 'keyreject' });
        }
    }

});


// Проверка ключей
const checkKey = (k, userID, userNAME) => {
    let c, i = 0, h = +userID;
    while (c = userNAME.charCodeAt(i++)) h = ((h << 5) + h) + c;
    return BigInt(h * h).toString(36) == k;
}


// События нажатия на уведомления
CN.onClicked.addListener(id => {
    if (id == 'update') {
        chrome.tabs.create({ 'url': 'https://sites.google.com/view/hwmtool/arcobot/arcobot_changelog' });
    }
    CN.clear(id);
});


const Reset = _ => {
    CSL.set({ userID: 'default', userNAME: null, login: false });
    chrome.action.setIcon({ path: 'icon.png' });

    // очистка уведомлений
    CN.getAll(notif => {
        if (notif) for (let key in notif) CN.clear(key);
    })
}
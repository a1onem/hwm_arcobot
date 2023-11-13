console.log('HWM ArcoBot :: content.js');

const CSL = chrome.storage.local;
const CROM = chrome.runtime.onMessage;
const CRSM = chrome.runtime.sendMessage;

const PAGE = document.body.innerHTML;

const IMG = 'i/cardGame/';
// доБашни, начальнаяБашня, начальнаяСтена, доРесурсов, шахта, руда, монастырь, мана, казарма, отряд
const CONDITIONS = {
    "Empire Capital,Eagle Nest,Harbour City": [50, 20, 5, 150, 2, 5, 2, 5, 2, 5],
    "East River,Portal Ruins,Mithril Coast,The Wilderness": [75, 20, 10, 200, 3, 5, 3, 5, 3, 5],
    "Tiger Lake,Dragons' Caves,Sublime Arbor,Great Wall": [150, 20, 10, 400, 5, 25, 5, 25, 5, 25],
    "Titans' Valley,Rogues' Wood,Shining Spring": [100, 20, 50, 300, 1, 5, 1, 5, 5, 25],
    "Wolf Dale,Sunny City,Fishing Village": [100, 50, 50, 300, 5, 20, 3, 10, 5, 20],
    "Peaceful Camp,Magma Mines,Kingdom Castle": [125, 20, 10, 350, 3, 15, 1, 5, 2, 10],
    "Lizard Lowland,Bear Mountain,Ungovernable Steppe": [200, 20, 10, 500, 1, 15, 1, 15, 1, 15],
    "Green Wood,Fairy Trees,Crystal Garden": [100, 30, 15, 300, 4, 10, 4, 10, 4, 10]
}

let userID;
// Заблокированные аккаунты
const BLOCKLIST = ['3691889'];

// Запись значений в storage.local
const setStorage = obj => CSL.set(obj);


if (/<!-- Login-->/.test(PAGE)) {

    CRSM({ 'logout': true });

} else {

    userID = /pl_hunter_stat.php\?id=(\d+)/.exec(PAGE)[1]; // ID персонажа
    // Старт
    CSL.get(null, storage => {
        // Проверяем не находится ли ID в списке блокировок
        !storage.blocked && BLOCKLIST.includes(userID) ? (CSL.clear(), setStorage({ blocked: true })) : Run(storage);
    });
}


const Run = storage => {

    if (!([userID + "_key"] in storage)) {
        // присваиваем дефолтные настройки новому игроку
        let obj = {}
        for (let key in storage) {
            if (/default_(.+)/.test(key)) {
                obj[userID + "_" + RegExp.$1] = storage[key];
            }
        }

        setStorage(obj);
        storage = { ...storage, ...obj };
    }

    if (!storage.login) {
        setStorage({ userID });
        CRSM({ login: true });
    }


    // прослушивание сообщений из popup
    CROM.addListener((request, sender, response) => {
        if (request.autocreate || request.joingame) {
            if (request.checked) {
                CSL.get(null, storage => makeGame(storage));
            } else if (/cancel_card/.test(PAGE)) {
                location = 'cancel_card_game.php';// если автоматическое создание партии отключено и создана заявка
            }
        } else location.reload();

        response(true);
    });

    if (storage[userID + '_info']) showConditions();
    if (storage[userID + '_stats'] && !/cancel_card/.test(PAGE)) showStats(); // показываем статистику, только если ещё не создана заявка

    makeGame(storage);
}


// Создаем игру в таверне и ждем оппонента
const makeGame = async storage => {

    if (/"map_star|в заявке на бой|<a c/.test(PAGE)) return // игрок в заявке на бой, перемещается или вступил в заявку карточного турнира

    // если включен поиск заявки по имени игрока (приоритетное действие)
    if (storage[userID + '_joingame'] && storage[userID + '_plist'].length > 0) {

        const plist = storage[userID + '_plist'];
        const links = document.querySelectorAll('a[href*="join_to_card_game"]');

        for (let link of links) {
            const player = link.parentNode.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.firstChild.textContent;

            // игрок найден, вступаем к нему в заявку
            if (plist.includes(player)) {
                link.click();
                break;
            }
        }
    }

    // Останавливаем скрипт, если не включено автоматическое создание заявки
    if (!storage[userID + '_autocreate']) return;

    // Покупаем золотые карты
    const goldcards = document.querySelector('td[width="40%"]>b').textContent;
    if (goldcards == "0" && storage[userID + '_goldcard']) await fetch('tavern.php?action=buy_gold');

    // Если заявка не создана, создаём, проверив сначала минимальную ставку
    if (!/cancel_card/.test(PAGE)) {

        const userGK = storage.userGK;
        let bet = storage[userID + '_bet'];
        if (bet == -1) bet = userGK < 5 ? 0 : userGK >= 5 && userGK < 12 ? 1 : 2;

        fetch(`create_card_game.php?timeout=15&ktype=${storage[userID + '_ktype']}&gold=${bet}`);
        location.reload();
    }

    // Если в заявку вступил игрок, переходим по ссылке начала партии
    if (/acard_game/.test(PAGE)) {
        let url = document.querySelector('a[href*="acard"]').href;
        location = url;
    }
}


// Выводим условия игр под секторами
const showConditions = () => {

    const elements = document.querySelectorAll('td[rowspan][class^="t"]');

    for (let el of elements) {

        const info = CONDITIONS[Object.keys(CONDITIONS).find(key => key.includes(el.textContent))];

        el.insertAdjacentHTML('beforeend', `<div class="arcinfo"><img src=${IMG}icon_buildings.png><div class="arctxt"><b>${info[0]}</b>&nbsp;${info[1]}/${info[2]}</div><br><img src=${IMG}icon_resources.png><div class="arctxt"><b>${info[3]}</b>&nbsp;<span style="color:red">${info[4]}/${info[5]}</span>&nbsp;<span style="color:blue">${info[6]}/${info[7]}</span>&nbsp;<span style="color:green">${info[8]}/${info[9]}</span></div></div>`)
    }
}

// Показ статистики игроков
const showStats = _ => {

    const table = document.querySelector('table[class="wb"]>tbody');

    for (let i = 2; i < table.children.length; i++) {

        const row = table.children[i].innerHTML;

        if (/game.php/.test(row)) {

            const id = /pl_info.php\?id=(\d+)/.exec(row)[1];
            fetch(`pl_info.php?id=${id}`).then(response => response.text().then(page => {

                const xmlDoc = new DOMParser().parseFromString(page, "text/html");
                const td = xmlDoc.querySelectorAll('td[width="50%"]>table>tbody')[1].children;

                const total = +td[0].children[1].textContent.replace(/,/g, '');
                const wins = +td[1].children[1].textContent.replace(/,/g, '');
                const wins_gold = +td[1].children[3].textContent.replace(/,/g, '');
                const loses_gold = +td[2].children[3].textContent.replace(/,/g, '');

                const winrate = Math.round(wins / total * 100);
                const gold = wins_gold - loses_gold;

                const player = table.querySelector(`a[href$="id=${id}"`).parentNode;

                player.insertAdjacentHTML('beforeend', `<div class="arcstats">Побед ${wins}/${total} (${winrate}%)<br>Баланс ${gold > 0 ? '+' : ''}${wins_gold - loses_gold}</div>`);
            }));
        }
    }
}
/*
CARDS[id][x]
x=1 ore
x=2 mana
x=3 army
x=4 action

4|0|1|72|1|1|2|2|2|2|7|6|7|7|5|7|5|5|20|20|85-18-49-92-48-21|0|0|t14-5|1|t101-d3-t14-|0|0|nick*message*123456~

[0] номер хода
[1] доступность хода (0, 1)
[2] порядок игрока (1, 2)
[3] время таймера
[4] шахты1
[5] шахты2
[6] монастыри1 
[7] монастыри2
[8] казармы1 
[9] казармы2
[10] руда1
[11] руда2
[12] мана1
[13] мана2
[14] отряды1
[15] отряды2
[16] стена1
[17] стена2
[18] башня1
[19] башня2
[20] id карт на руках
[21] победивший игрок (1, 2, 0 - ничья)
[22] способ победы (1-постойка огромной башни, 2-разрушение башни противника, 5-закончилась по таймауту)
[23] id карты хода -затраты?
[24] сходивший игрок (1, 2)
[25] id карт в стеке
[26] сброс карты (0, 1)
[27] id чата
[28] сообщения чата (ник*сообщение*id чата~ник...)

action=getnicks
Mak32#379928|Thestovar#1679067|50|150|100|18|1|0|17|2|3|5|2|2|5|2|8|24|8|7|1|5|0|18|25|NA|0|0|t86-0|2|t86-|0|0||0||0

[0] первый игрок (ник#ID)
[1] второй игрок (ник#ID)
[2] башня до 
[3] ресурсы до
[4] ставка золота
[5] номер хода
[6] ходит игрок (1, 2)
[7]
[8] таймер хода

*/
console.log('HWM ArcoBot :: arcobot.js')

const CSL = chrome.storage.local;
const CR = chrome.runtime;

// Получаем объект storage.local
const getStorage = () => new Promise(resolve => CSL.get(null, storage => resolve(storage)));
// Запись значений в storage.local
const setStorage = obj => CSL.set(obj);

const pause = t => new Promise(resolve => setTimeout(resolve, t));
// Теневая загрузка страниц
const loadPage = async url => {
    try { return new TextDecoder('windows-1251').decode(new DataView(await (await fetch(url)).arrayBuffer())); } catch (e) { }
}

const CARDS = { "0": [0, 0, 0, 4], "1": [0, 0, 0, 1], "2": [1, 0, 0, 3], "3": [3, 0, 0, 5], "4": [4, 0, 0, 5], "5": [7, 0, 0, 5], "6": [2, 0, 0, 4], "7": [5, 0, 0, 4], "8": [2, 0, 0, 3], "9": [3, 0, 0, 3], "10": [2, 0, 0, 5], "11": [3, 0, 0, 3], "12": [7, 0, 0, 4], "13": [8, 0, 0, 5], "14": [0, 0, 0, 4], "15": [5, 0, 0, 3], "16": [4, 0, 0, 2], "17": [6, 0, 0, 5], "18": [0, 0, 0, 4], "19": [8, 0, 0, 3], "20": [9, 0, 0, 5], "21": [9, 0, 0, 3], "22": [11, 0, 0, 1], "23": [13, 0, 0, 3], "24": [15, 0, 0, 1], "25": [16, 0, 0, 3], "26": [18, 0, 0, 2], "27": [24, 0, 0, 1], "28": [7, 0, 0, 3], "29": [1, 0, 0, 1], "30": [6, 0, 0, 4], "31": [10, 0, 0, 5], "32": [14, 0, 0, 2], "33": [17, 0, 0, 4], "34": [0, 1, 0, 1], "35": [0, 2, 0, 7], "36": [0, 2, 0, 1], "37": [0, 3, 0, 5], "38": [0, 5, 0, 1], "39": [0, 4, 0, 1], "40": [0, 6, 0, 4], "41": [0, 2, 0, 7], "42": [0, 3, 0, 1], "43": [0, 4, 0, 7], "44": [0, 3, 0, 4], "45": [0, 7, 0, 1], "46": [0, 7, 0, 4], "47": [0, 6, 0, 1], "48": [0, 9, 0, 1], "49": [0, 8, 0, 4], "50": [0, 7, 0, 1], "51": [0, 10, 0, 1], "52": [0, 5, 0, 4], "53": [0, 13, 0, 1], "54": [0, 4, 0, 1], "55": [0, 12, 0, 1], "56": [0, 14, 0, 1], "57": [0, 16, 0, 1], "58": [0, 15, 0, 1], "59": [0, 17, 0, 1], "60": [0, 21, 0, 1], "61": [0, 8, 0, 1], "62": [0, 0, 0, 1], "63": [0, 0, 0, 4], "64": [0, 5, 0, 1], "65": [0, 11, 0, 4], "66": [0, 18, 0, 1], "67": [0, 0, 0, 4], "68": [0, 0, 1, 2], "69": [0, 0, 1, 4], "70": [0, 0, 3, 5], "71": [0, 0, 3, 4], "72": [0, 0, 4, 4], "73": [0, 0, 6, 7], "74": [0, 0, 3, 2], "75": [0, 0, 5, 2], "76": [0, 0, 6, 7], "77": [0, 0, 7, 5], "78": [0, 0, 8, 1], "79": [0, 0, 0, 5], "80": [0, 0, 5, 2], "81": [0, 0, 6, 2], "82": [0, 0, 6, 2], "83": [0, 0, 5, 4], "84": [0, 0, 8, 2], "85": [0, 0, 9, 2], "86": [0, 0, 11, 2], "87": [0, 0, 9, 2], "88": [0, 0, 10, 2], "89": [0, 0, 14, 7], "90": [0, 0, 11, 2], "91": [0, 0, 12, 2], "92": [0, 0, 15, 2], "93": [0, 0, 17, 2], "94": [0, 0, 25, 2], "95": [0, 0, 2, 2], "96": [0, 0, 2, 2], "97": [0, 0, 4, 4], "98": [0, 0, 13, 4], "99": [0, 0, 18, 7], "100": [0, 2, 0, 6], "101": [0, 0, 2, 6] }

const DELAY = 3000, RESVAL = 14, TOWER_OFFSET = 20;

let userID, towerLevel;

// Подготовка к партии
const gameID = /gameid=(\d+)/.exec(location.href)[1];
const gameURL = `cardsgame.php?gameid=${gameID}`;


const Run = async () => {

    let storage = await getStorage();
    userID = storage.userID;

    await pause(500);

    const link = document.querySelector('div[id="nick1"]');

    if (link.firstElementChild == null) {

        // прослушивание сообщений из Попап
        CR.onMessage.addListener(request => {
            if (request.reload) location.reload();
        });

        const text = await loadPage(`${gameURL}&action=getnicks`);
        towerLevel = +text.split('|')[2]; // определяем условия игры - уровень башни

        // если пользователь перезагрузил браузер или сразу оказался в партии после установки расширения
        if (userID == 'default') {

            userID = RegExp(`${link.textContent}#(\\d+)`).exec(text)[1];

            // смотрим есть ли пользователь в настройках
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

            setStorage({ userID });
            CR.sendMessage({ login: true, userID });
        }

        if (!storage[userID + '_active']) return;

        // Меняем имя игрока на ArcoBot
        link.setAttribute('style', 'display:none');
        link.parentElement.insertAdjacentText('afterbegin', 'HWM ArcoBot');
        Ticker();
    }
}


const Ticker = async () => {
    const data = await loadPage(gameURL);
    Proceed(data);
}


// Анализ данных
const Proceed = async data => {

    let arr = data.split('|');
    let cardIds = arr[20].split('-').map(id => +id); // получаем id всех карт на руке, преобразуем в числовые значения

    let turn = arr[0];
    let order = arr[2];

    // Определяем номер игрока
    let n = order == '2' ? 1 : 0;
    let myore = +arr[10 + n];
    let mymana = +arr[12 + n];
    let myarmy = +arr[14 + n];

    if (arr[22] == '0') {

        // Можно делать ход
        if (arr[1] == '1' && arr[26] == '0') {

            console.log(cardIds)
            let availCards = [...cardIds];

            cardIds.forEach(id => {
                // Проверяем хватает ли ресурсов на карты; если нет, то удаляем карты из доступных
                if (CARDS[id][0] > myore || CARDS[id][1] > mymana || CARDS[id][2] > myarmy) {
                    availCards = availCards.filter(card => card !== id);
                }
            });

            if (availCards.length > 0) {

                let card = await chooseCard(availCards, arr, n);
                if (card == null) {
                    console.log('На текущем ходу нет подходящей карты.');
                    dropCard(cardIds, turn, myore, mymana, myarmy);

                } else {
                    // Делаем ход
                    let cardn = cardIds.indexOf(card);
                    let params = `&action=turn&cardid=${card}&cardn=${cardn}&turn=${turn}`;
                    fetch(gameURL + params);
                }

            } else {
                console.log('Не хватает ресурсов ни на одну карту.');
                // Если доступных для хода карт нет, сбрасываем
                dropCard(cardIds, turn, myore, mymana, myarmy);
            }

        } else if (arr[1] == '1' && arr[26] == '1') {
            // Требуется сброс карты
            dropCard(cardIds, turn, myore, mymana, myarmy);
        }

    } else {
        // Если игра завершена
        endGame();
        return;
    }

    await pause(getDelay());
    Ticker();
}


// Мозг
const chooseCard = async (availCards, arr, n) => {

    /*
    act:
    0 - ненужные карты
    1 - постройка башни
    2 - разрушение врага
    3 - постройка стены
    4 - особые манипуляции: 0, 6, 7, 12, 14, 18, 30, 33, 40, 44, 46, 49, 52, 63, 65, 67, 69, 71, 72, 83, 97, 98
    5 - прирост количества строений
    6 - сброс\играем снова
    7 - урон башне врага
    */

    let act1 = [], act2 = [], act3 = [], act4 = [], act5 = [], act6 = [], act7 = [], winturn = [], turnagain = [];
    let mytower = +arr[18 + n], enemytower = +arr[19 - n];
    let mywall = +arr[16 + n], enemywall = +arr[17 - n];
    let mymon = +arr[6 + n], enemymon = +arr[7 - n];
    let mymines = +arr[4 + n], enemymines = +arr[5 - n];
    let enemymana = +arr[13 - n], enemyore = +arr[11 - n];
    let myarmy = +arr[14 + n], myore = +arr[10 + n], mymana = +arr[12 + n];

    // Критическая точка врага
    const storage = await getStorage();
    let damagealert = false;

    if (storage[userID + '_critpoint'] == 'auto') {
        // критическая высота башни противника: (towerLevel - TOWER_OFFSET)
        // значения маны и руды вычисляются динамически исходя из высоты башни
        // начиная с 14 и дальше уменьшается по мере роста башни противника к финальному результату
        damagealert = enemytower >= towerLevel - TOWER_OFFSET && (enemymana >= towerLevel - TOWER_OFFSET + RESVAL - enemytower || enemyore >= towerLevel - TOWER_OFFSET + RESVAL - enemytower);
    } else {
        const ts = storage[userID + '_towersize'];
        damagealert = enemytower >= ts && (enemymana >= ts + storage[userID + '_manaval'] - enemytower || enemyore >= ts + storage[userID + '_oreval'] - enemytower);
    }

    if (damagealert) console.log('Критическая точка');

    availCards.forEach(id => {

        if (CARDS[id][3] == 1) act1.push(id);
        if (CARDS[id][3] == 2) act2.push(id);
        if (CARDS[id][3] == 3) act3.push(id);
        if (CARDS[id][3] == 5) act5.push(id);
        if (CARDS[id][3] == 6) act6.push(id);
        if (CARDS[id][3] == 7) act7.push(id);

        // особые условия
        if (CARDS[id][3] == 4) {
            if ((id == 0 && myore == 0) ||
                (id == 6 && mywall == 0 && mymana > 25) ||
                (id == 7 && enemymines - mymines >= 1) ||
                (id == 12 && (mywall == 0 || mywall > 10)) ||
                (id == 14 && ((mymines > 2 && mymines > enemymines && enemymines > 0) || (mymines == 0 && enemymines > 0))) ||
                (id == 18 && (mymines > 2 || mymines == 0)) ||
                (id == 30 && enemywall < mywall) ||
                (id == 33 && enemywall - mywall > 10) ||
                ((id == 40 || id == 63) && enemytower < towerLevel - 1) ||
                (id == 44 && mytower > 5) ||
                (id == 46 && enemymon - mymon >= 1) ||
                (id == 49 && (damagealert || enemytower <= 9)) ||
                (id == 52 && (damagealert || enemytower <= 7)) ||
                (id == 65 && mytower > enemywall && (damagealert || enemytower <= 8)) ||
                (id == 67 && myarmy == 0) ||
                (id == 69 && (enemywall == 0 || enemytower + enemywall <= 4)) ||
                (id == 71 && (mywall > 3 || enemytower + enemywall <= 6)) ||
                (id == 72 && (mywall >= 1 || enemytower <= 3)) ||
                (id == 83 && (enemywall == 0 || enemytower + enemywall <= 6)) ||
                (id == 97 && ((enemywall < 4 && mytower > 4) || enemywall + enemytower <= 8)) ||
                (id == 98 && (enemywall < 10 || enemytower + enemywall <= 13))) {
                act4.push(id);
            }
        }

        // играем снова
        if (/^(?:1|2|13|34|35|68|73)$/.test(id)) turnagain.push(id);

        // победный ход
        if (
            // добивание противника
            ((id == 26 || id == 84 || id == 92 || id == 93) && enemytower + enemywall <= 10) ||
            (id == 30 && enemywall < mywall && enemytower <= 2) ||
            ((id == 32 || id == 59 || id == 71 || id == 80 || id == 82 || id == 83) && enemytower + enemywall <= 6) ||
            (id == 35 && enemytower == 1) ||
            ((id == 41 || id == 72) && enemytower <= 3) ||
            ((id == 43 || id == 89) && enemytower <= 5) ||
            (id == 49 && enemytower <= 9) ||
            (id == 52 && enemytower <= 7) ||
            ((id == 53 || id == 76) && enemytower <= 4) ||
            ((id == 64 || id == 73) && enemytower <= 2) ||
            (id == 65 && ((mytower > enemywall && enemytower <= 8) || enemytower + enemywall <= 8)) ||
            ((id == 68 || id == 78) && enemytower + enemywall <= 2) ||
            ((id == 69 || id == 75) && enemytower + enemywall <= 4) ||
            (id == 74 && enemytower + enemywall <= 5) ||
            ((id == 81 || id == 86) && enemytower + enemywall <= 7) ||
            (id == 85 && enemytower + enemywall <= 9) ||
            (id == 87 && ((mymon > enemymon && enemytower + enemywall <= 12) || enemytower + enemywall <= 8)) ||
            (id == 88 && ((mywall > enemywall && enemytower <= 6) || enemytower + enemywall <= 6)) ||
            ((id == 90 || id == 97) && enemytower + enemywall <= 8) ||
            (id == 94 && enemytower + enemywall <= 20) ||
            (id == 95 && ((mywall > enemywall && enemytower + enemywall <= 3) || enemytower + enemywall <= 2)) ||
            (id == 96 && enemytower + enemywall <= 3) ||
            (id == 98 && enemytower + enemywall <= 13) ||
            (id == 99 && enemytower <= 12) ||

            // достройка башни
            ((id == 22 || id == 36 || id == 40 && id == 45) && mytower >= towerLevel - 3) ||
            ((id == 24 || id == 42 || id == 48 || id == 50) && mytower >= towerLevel - 5) ||
            ((id == 27 || id == 38 || id == 47 || id == 55 || id == 56) && mytower >= towerLevel - 8) ||
            (id == 29 && mytower == towerLevel - 1) ||
            ((id == 39 || id == 78) && mytower >= towerLevel - 2) ||
            ((id == 51 || id == 61) && mytower >= towerLevel - 11) ||
            (id == 53 && mytower >= towerLevel - 6) ||
            (id == 54 && mytower >= towerLevel - 7) ||
            (id == 57 && mytower >= towerLevel - 15) ||
            (id == 58 && mytower >= towerLevel - 10) ||
            (id == 59 && mytower >= towerLevel - 12) ||
            (id == 60 && mytower >= towerLevel - 20) ||
            (id == 62 && ((mytower == towerLevel - 2 && mytower < enemytower) || mytower == towerLevel - 1)) ||
            (id == 64 && mytower >= towerLevel - 4) ||
            (id == 66 && mytower >= towerLevel - 13)) {
            winturn.push(id)
        }
    });

    let card = null;

    if (winturn.length > 0) {
        console.log('Победный ход');
        card = maxCost(winturn);

    } else if (turnagain.length > 0) {
        console.log('Играем снова');
        card = maxCost(turnagain);

    } else if (act6.length > 0 && act1.length == 0) {
        console.log('Сброс / Играем снова');
        card = act6[Random(act6)];

    } else if (act4.length > 0 && (damagealert || act1.length == 0)) {
        console.log('Особые манипуляции');
        card = maxCost(act4);

    } else if (act7.length > 0 && (damagealert || enemytower < 15) && mytower + mywall > 10) {
        console.log('Разрушаю башню врага');
        card = maxCost(act7);

    } else if (act2.length > 0 && (damagealert || enemytower + enemywall <= 20 || act1.length == 0)) {
        console.log('Разрушаю врага');
        card = maxCost(act2);

    } else if (act1.length > 0) {
        console.log('Строю башню');
        card = maxCost(act1);

    } else if (act3.length > 0) {
        console.log('Строю стену');
        card = maxCost(act3);

    } else if (act5.length > 0) {
        console.log('Наращиваю строения');
        card = maxCost(act5);

    } else if (act6.length > 0) {
        console.log('Сброс / Играем снова');
        card = act6[Random(act6)];
    }

    return card;
}

// Выбираем наиболее "эффективную" карту
const maxCost = act => {
    let bestcard, maxcost = -1;
    act.forEach(id => {
        let curcost = cardCost(id);
        if (curcost > maxcost) {
            bestcard = id;
            maxcost = curcost;
        }
    });
    return bestcard;
}


// Сброс карты
const dropCard = (cardIds, turn, myore, mymana, myarmy) => {

    let drop = [], randomCard, cardn;

    // формируем массив неважных карт
    cardIds.forEach(id => {
        if (CARDS[id][3] == 0) {
            drop.push(id);
        }
    });

    if (drop.length == 0) {

        cardIds.forEach(id => {

            let diff;

            if (id < 34) diff = CARDS[id][0] - myore;
            else if ((id >= 34 && id <= 66) || id == 100) diff = CARDS[id][1] - mymana;
            else if (id > 66) diff = CARDS[id][2] - myarmy;

            if (/1|7/.test(CARDS[id][3]) || /49|52|65/.test(id)) {
                // резервируем карты act1, act7 и фаталити карты
                drop.push(-1 * cardCost(id));
            } else if (diff > 0) {
                drop.push(diff);
            } else {
                drop.push('trash');
            }
        });

        if (drop.includes('trash')) {

            console.log('Сбрасываю доступную, но ненужную на текущем ходу карту.');
            cardn = drop.indexOf('trash');

        } else {

            console.log('Сбрасываю наиболее недостижимую карту.');
            cardn = drop.indexOf(Math.max(...drop));
        }

        randomCard = cardIds[cardn];
        console.log(drop, cardn);

    } else {
        console.log('Сбрасываю ненужную карту.');
        randomCard = drop[Random(drop)];
        cardn = cardIds.indexOf(randomCard);
    }

    let params = `&action=drop&cardid=${randomCard}&cardn=${cardn}&turn=${turn}`;
    fetch(gameURL + params);
}


// Конец игры
const endGame = async () => {
    const storage = await getStorage();
    if (storage[userID + '_return']) {
        await pause(5000);
        // читаем текущий уровнеь ГК
        const page = await loadPage(`pl_info.php?id=${userID}`);
        const userGK = +/Картежников: (\d+)/.exec(page)[1];
        const minIDX = userGK < 5 ? 0 : userGK >= 5 && userGK < 12 ? 1 : 2;
        // перезаписываем ставку, если уровень ГК повысился, и она уже недоступна
        const bet = storage[userID + '_bet'];
        const newBet = bet < minIDX && bet > -1 ? { [userID + '_bet']: minIDX } : {};
        setStorage({ userGK, ...newBet });

        location = 'tavern.php';
    }
}


// Стоимость карты
const cardCost = id => CARDS[id][0] + CARDS[id][1] + CARDS[id][2];

// Отправка сообщений
// const sendMessage = msg => fetch('cardsgame.php', { method: 'POST', headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `msg=${msg}&post%5Fchat=1&gameid=${gameID}` });

// Выбор случайной карты из массива
const Random = array => Math.random() * array.length | 0;

// Плавающая задержка
const getDelay = () => DELAY + Math.random() * 2000 | 0;


Run();


/*
ci['0text'] ='Бракованная руда'; ci['0ore_cost'] = 0; ci['0mana_cost'] = 0; ci['0army_cost'] = 0; ci['0action_text'] = 'Все игроки теряют по 8 руды';
ci['1text'] ='Счастливая монетка'; ci['1ore_cost'] = 0; ci['1mana_cost'] = 0; ci['1army_cost'] = 0; ci['1action_text'] = '+2 руды, +2 маны, играем снова';
ci['2text'] ='Благодатная почва'; ci['2ore_cost'] = 1; ci['2mana_cost'] = 0; ci['2army_cost'] = 0;  ci['2action_text'] = '+1 к стене, играем снова';
ci['3text'] ='Шахтеры'; ci['3ore_cost'] = 3; ci['3mana_cost'] = 0; ci['3army_cost'] = 0;ci['3action_text'] = '+1 шахта';
ci['4text'] ='Большая жила'; ci['4ore_cost'] = 4; ci['4mana_cost'] = 0; ci['4army_cost'] = 0; ci['4action_text'] = 'Если шахта меньше чем у врага, то шахта +2, иначе шахта +1';
ci['5text'] ='Гномы-шахтеры'; ci['5ore_cost'] = 7; ci['5mana_cost'] = 0; ci['5army_cost'] = 0; ci['5action_text'] = '+4 к стене, +1 шахта';
ci['6text'] ='Сверхурочные'; ci['6ore_cost'] = 2; ci['6mana_cost'] = 0; ci['6army_cost'] = 0;  ci['6action_text'] = '+5 к стене, вы теряете 6 маны';
ci['7text'] ='Кража технологий'; ci['7ore_cost'] = 5; ci['7mana_cost'] = 0; ci['7army_cost'] = 0;  ci['7action_text'] = 'Если шахта меньше чем врага, то шахта становится равной вражеской';
ci['8text'] ='Обычная стена'; ci['8ore_cost'] = 2; ci['8mana_cost'] = 0; ci['8army_cost'] = 0;  ci['8action_text'] = '+3 к стене';
ci['9text'] ='Большая стена'; ci['9ore_cost'] = 3; ci['9mana_cost'] = 0; ci['9army_cost'] = 0; ci['9action_text'] = '+4 к стене';
ci['10text'] ='Новшества'; ci['10ore_cost'] = 2; ci['10mana_cost'] = 0; ci['10army_cost'] = 0;  ci['10action_text'] = '+1 к шахте всех игроков, вы получаете 4 маны';
ci['11text'] ='Фундамент'; ci['11ore_cost'] = 3; ci['11mana_cost'] = 0; ci['11army_cost'] = 0;  ci['11action_text'] = 'Если стена=0, то +6 к стене, иначе +3 к стене';
ci['12text'] ='Толчки'; ci['12ore_cost'] = 7; ci['12mana_cost'] = 0; ci['12army_cost'] = 0;  ci['12action_text'] = 'Все стены получают по 5 повреждений, играем снова';
ci['13text'] ='Секретная пещера'; ci['13ore_cost'] = 8; ci['13mana_cost'] = 0; ci['13army_cost'] = 0;  ci['13action_text'] = '+1 монастырь, играем снова';
ci['14text'] ='Землетрясение'; ci['14ore_cost'] = 0; ci['14mana_cost'] = 0; ci['14army_cost'] = 0; ci['14action_text'] = '-1 шахта всех игроков';
ci['15text'] ='Усиленная стена'; ci['15ore_cost'] = 5; ci['15mana_cost'] = 0; ci['15army_cost'] = 0; ci['15action_text'] = '+6 к стене';
ci['16text'] ='Обвал'; ci['16ore_cost'] = 4; ci['16mana_cost'] = 0; ci['16army_cost'] = 0; ci['16action_text'] = '-1 шахта врага';
ci['17text'] ='Новое оборудование'; ci['17ore_cost'] = 6; ci['17mana_cost'] = 0; ci['17army_cost'] = 0;  ci['17action_text'] = '+2 к шахте';
ci['18text'] ='Обвал рудника'; ci['18ore_cost'] = 0; ci['18mana_cost'] = 0; ci['18army_cost'] = 0;  ci['18action_text'] = '-1 шахта, +10 к стене, вы получаете 5 маны';
ci['19text'] ='Великая стена'; ci['19ore_cost'] = 8; ci['19mana_cost'] = 0; ci['19army_cost'] = 0;  ci['19action_text'] = '+8 к стене';
ci['20text'] ='Галереи'; ci['20ore_cost'] = 9; ci['20mana_cost'] = 0; ci['20army_cost'] = 0;  ci['20action_text'] = '+5 к стене, +1 казарма';
ci['21text'] ='Магическая гора'; ci['21ore_cost'] = 9; ci['21mana_cost'] = 0; ci['21army_cost'] = 0;  ci['21action_text'] = '+7 к стене, +7 маны';
ci['22text'] ='Поющий уголь'; ci['22ore_cost'] = 11; ci['22mana_cost'] = 0; ci['22army_cost'] = 0; ci['22action_text'] = '+6 к стене, +3 к башне';
ci['23text'] ='Бастион'; ci['23ore_cost'] = 13; ci['23mana_cost'] = 0; ci['23army_cost'] = 0; ci['23action_text'] = '+12 к стене';
ci['24text'] ='Новые успехи'; ci['24ore_cost'] = 15; ci['24mana_cost'] = 0; ci['24army_cost'] = 0;  ci['24action_text'] = '+8 к стене, +5 к башне';
ci['25text'] ='Величайшая стена'; ci['25ore_cost'] = 16; ci['25mana_cost'] = 0; ci['25army_cost'] = 0;  ci['25action_text'] = '+15 к стене';
ci['26text'] ='Скаломет'; ci['26ore_cost'] = 18; ci['26mana_cost'] = 0; ci['26army_cost'] = 0; ci['26action_text'] = '+6 к стене, 10 единиц урона врагу';
ci['27text'] ='Сердце дракона'; ci['27ore_cost'] = 24; ci['27mana_cost'] = 0; ci['27army_cost'] = 0;ci['27action_text'] = '+20 к стене, +8 к башне';
ci['28text'] ='Рабский труд'; ci['28ore_cost'] = 7; ci['28mana_cost'] = 0; ci['28army_cost'] = 0;  ci['28action_text'] = '+9 к стене, вы теряете 5 отрядов';
ci['29text'] ='Сад камней'; ci['29ore_cost'] = 1; ci['29mana_cost'] = 0; ci['29army_cost'] = 0;  ci['29action_text'] = '+1 к стене, +1 к башне, +2 отряда';
ci['30text'] ='Грунтовые воды'; ci['30ore_cost'] = 6; ci['30mana_cost'] = 0; ci['30army_cost'] = 0;  ci['30action_text'] = 'Игрок с меньшей стеной теряет 1 казарму и получает 2 урона к башне';
ci['31text'] ='Казармы'; ci['31ore_cost'] = 10; ci['31mana_cost'] = 0; ci['31army_cost'] = 0;  ci['31action_text'] = '+6 отрядов  +6 к стене. Если казарма < вражеской, то +1 казарма';
ci['32text'] ='Укрепления'; ci['32ore_cost'] = 14; ci['32mana_cost'] = 0; ci['32army_cost'] = 0;  ci['32action_text'] = '+7 к стене, 6 урона врагу';
ci['33text'] ='Сдвиг'; ci['33ore_cost'] = 17; ci['33mana_cost'] = 0; ci['33army_cost'] = 0;  ci['33action_text'] = 'Ваша и вражеская стена меняются местами';
ci['34text'] ='Кварц'; ci['34ore_cost'] =0 ; ci['34mana_cost'] = 1; ci['34army_cost'] = 0;  ci['34action_text'] = '+1 к башне, играем снова';
ci['35text'] ='Дымчатый кварц'; ci['35ore_cost'] =0 ; ci['35mana_cost'] = 2; ci['35army_cost'] = 0;  ci['35action_text'] = '1 урона Башне врага, Играем снова';
ci['36text'] ='Аметист'; ci['36ore_cost'] =0 ; ci['36mana_cost'] = 2; ci['36army_cost'] = 0;  ci['36action_text'] = '+3 к башне';
ci['37text'] ='Ткачи заклинаний'; ci['37ore_cost'] =0 ; ci['37mana_cost'] = 3; ci['37army_cost'] = 0;  ci['37action_text'] = '+1 монастырь';
ci['38text'] ='Рудная жила'; ci['38ore_cost'] =0 ; ci['38mana_cost'] = 5; ci['38army_cost'] = 0;  ci['38action_text'] = '+8 к башне';
ci['39text'] ='Затмение'; ci['39ore_cost'] =0 ; ci['39mana_cost'] = 4; ci['39army_cost'] = 0; ci['39action_text'] = '+2 к башне, 2 ед. урона башне врага';
ci['40text'] ='Матрица'; ci['40ore_cost'] =0 ; ci['40mana_cost'] = 6; ci['40army_cost'] = 0; ci['40action_text'] = '+1 монастырь, +3 к башне, +1 к башне врага';
ci['41text'] ='Трещина'; ci['41ore_cost'] =0 ; ci['41mana_cost'] = 2; ci['41army_cost'] = 0; ci['41action_text'] = '3 урона башне врага';
ci['42text'] ='Рубин'; ci['42ore_cost'] =0 ; ci['42mana_cost'] = 3; ci['42army_cost'] = 0; ci['42action_text'] = '+5 к башне';
ci['43text'] ='Копье'; ci['43ore_cost'] =0 ; ci['43mana_cost'] = 4; ci['43army_cost'] = 0;  ci['43action_text'] = '5 урона башне врага';
ci['44text'] ='Взрыв силы'; ci['44ore_cost'] =0 ; ci['44mana_cost'] = 3; ci['44army_cost'] = 0; ci['44action_text'] = '5 урона собственной башне, +2 монастырь';
ci['45text'] ='Гармония'; ci['45ore_cost'] =0 ; ci['45mana_cost'] = 7; ci['45army_cost'] = 0;  ci['45action_text'] = '+1 монастырь, +3 к башне, +3 к стене';
ci['46text'] ='Паритет'; ci['46ore_cost'] =0 ; ci['46mana_cost'] = 7; ci['46army_cost'] = 0;  ci['46action_text'] = 'Монастырь всех становится равным монастырю сильнейшего';
ci['47text'] ='Эмеральд'; ci['47ore_cost'] =0 ; ci['47mana_cost'] = 6; ci['47army_cost'] = 0; ci['47action_text'] = '+8 к башне';
ci['48text'] ='Жемчуг мудрости'; ci['48ore_cost'] =0 ; ci['48mana_cost'] = 9; ci['48army_cost'] = 0;  ci['48action_text'] = '+5 к башне, +1 монастырь';
ci['49text'] ='Дробление'; ci['49ore_cost'] =0 ; ci['49mana_cost'] = 8; ci['49army_cost'] = 0; ci['49action_text'] = '-1 монастырь, 9 урона башне врага';
ci['50text'] ='Мягкий камень'; ci['50ore_cost'] =0 ; ci['50mana_cost'] = 7; ci['50army_cost'] = 0; ci['50action_text'] = '+5 к башне, враг теряет 6 руды';
ci['51text'] ='Сапфир'; ci['51ore_cost'] =0 ; ci['51mana_cost'] = 10; ci['51army_cost'] = 0; ci['51action_text'] = '+11 к башне';
ci['52text'] ='Раздоры'; ci['52ore_cost'] =0 ; ci['52mana_cost'] = 5; ci['52army_cost'] = 0; ci['52action_text'] = '7 урона всем башням, -1 монастырь всех игроков';
ci['53text'] ='Огненный рубин'; ci['53ore_cost'] =0 ; ci['53mana_cost'] = 13; ci['53army_cost'] = 0; ci['53action_text'] = '+6 к башне, 4 урона башне врага';
ci['54text'] ='Помощь в работе'; ci['54ore_cost'] =0 ; ci['54mana_cost'] = 4; ci['54army_cost'] = 0; ci['54action_text'] = '+7 к башне, вы теряете 10 руды';
ci['55text'] ='Кристальный щит'; ci['55ore_cost'] =0 ; ci['55mana_cost'] = 12; ci['55army_cost'] = 0; ci['55action_text'] = '+8 к башне, +3 к стене';
ci['56text'] ='Эмпатия'; ci['56ore_cost'] =0 ; ci['56mana_cost'] = 14; ci['56army_cost'] = 0; ci['56action_text'] = '+8 к башне, +1 казарма';
ci['57text'] ='Алмаз'; ci['57ore_cost'] =0 ; ci['57mana_cost'] = 16; ci['57army_cost'] = 0; ci['57action_text'] = '+15 к башне';
ci['58text'] ='Монастырь'; ci['58ore_cost'] =0 ; ci['58mana_cost'] = 15; ci['58army_cost'] = 0;ci['58action_text'] = '+10 к башне, +5 к стене, вы получаете 5 отрядов';
ci['59text'] ='Сияющий камень'; ci['59ore_cost'] =0 ; ci['59mana_cost'] = 17; ci['59army_cost'] = 0;ci['59action_text'] = '+12 к башне, 6 урона врагу';
ci['60text'] ='Глаз дракона'; ci['60ore_cost'] =0 ; ci['60mana_cost'] = 21; ci['60army_cost'] = 0; ci['60action_text'] = '+20 к башне';
ci['61text'] ='Отвердение'; ci['61ore_cost'] =0 ; ci['61mana_cost'] = 8; ci['61army_cost'] = 0; ci['61action_text'] = '+11 к башне, -6 к стене';
ci['62text'] ='Бижутерия'; ci['62ore_cost'] =0 ; ci['62mana_cost'] = 0; ci['62army_cost'] = 0; ci['62action_text'] = 'Если башня < вражеской, то +2 к башне, иначе +1';
ci['63text'] ='Радуга'; ci['63ore_cost'] =0 ; ci['63mana_cost'] = 0; ci['63army_cost'] = 0; ci['63action_text'] = '+1 к башням всех, вы получаете 3 маны';
ci['64text'] ='Вступление'; ci['64ore_cost'] =0 ; ci['64mana_cost'] = 5; ci['64army_cost'] = 0; ci['64action_text'] = '+4 к башне, вы теряете 3 отряда. 2 урона башне врага';
ci['65text'] ='Молния'; ci['65ore_cost'] =0 ; ci['65mana_cost'] = 11; ci['65army_cost'] = 0; ci['65action_text'] = 'Если башня > стены врага, то 8 урона башне врага, иначе 8 урона всем';
ci['66text'] ='Медитация'; ci['66ore_cost'] =0 ; ci['66mana_cost'] = 18; ci['66army_cost'] = 0; ci['66action_text'] = '+13 к башне, +6 отрядов, +6 руды';
ci['67text'] ='Коровье бешенство'; ci['67ore_cost'] = 0; ci['67mana_cost'] = 0; ci['67army_cost'] = 0; ci['67action_text'] = 'Все игроки теряют по 6 отрядов';
ci['68text'] ='Фея'; ci['68ore_cost'] = 0; ci['68mana_cost'] = 0; ci['68army_cost'] = 1; ci['68action_text'] = '2 единицы урона. Играем снова';
ci['69text'] ='Гоблины'; ci['69ore_cost'] = 0; ci['69mana_cost'] = 0; ci['69army_cost'] = 1;  ci['69action_text'] = '4 единицы урона. Вы теряете 3 маны';
ci['70text'] ='Минотавр'; ci['70ore_cost'] = 0; ci['70mana_cost'] = 0; ci['70army_cost'] = 3;  ci['70action_text'] = '+1 казарма';
ci['71text'] ='Армия гоблинов'; ci['71ore_cost'] = 0; ci['71mana_cost'] = 0; ci['71army_cost'] = 3; ci['71action_text'] = '6 единиц урона. Вы получаете 3 единицы урона';
ci['72text'] ='Гоблины-лучники'; ci['72ore_cost'] = 0; ci['72mana_cost'] = 0; ci['72army_cost'] = 4; ci['72action_text'] = '3 урона башне врага. Вы получаете 1 ед. урона';
ci['73text'] ='Призрачная фея'; ci['73ore_cost'] = 0; ci['73mana_cost'] = 0; ci['73army_cost'] = 6; ci['73action_text'] = '2 урона башне врага, Играем снова.';
ci['74text'] ='Орк'; ci['74ore_cost'] = 0; ci['74mana_cost'] = 0; ci['74army_cost'] = 3;  ci['74action_text'] = '5 урона';
ci['75text'] ='Гномы'; ci['75ore_cost'] = 0; ci['75mana_cost'] = 0; ci['75army_cost'] = 5; ci['75action_text'] = '4 урона, +3 к стене';
ci['76text'] ='Маленькие змейки'; ci['76ore_cost'] = 0; ci['76mana_cost'] = 0; ci['76army_cost'] = 6;  ci['76action_text'] = '4 урона башне врага';
ci['77text'] ='Тролль-наставник'; ci['77ore_cost'] = 0; ci['77mana_cost'] = 0; ci['77army_cost'] = 7; ci['77action_text'] = '+2 к казарме';
ci['78text'] ='Гремлин в башне'; ci['78ore_cost'] = 0; ci['78mana_cost'] = 0; ci['78army_cost'] = 8;ci['78action_text'] = '2 урона, +4 к стене, +2 к башне';
ci['79text'] ='Полнолуние'; ci['79ore_cost'] = 0; ci['79mana_cost'] = 0; ci['79army_cost'] = 0;ci['79action_text'] = '+1 казарма всем игрокам, Вы получаете 3 отряда';
ci['80text'] ='Крушитель'; ci['80ore_cost'] = 0; ci['80mana_cost'] = 0; ci['80army_cost'] = 5;  ci['80action_text'] = '6 урона';
ci['81text'] ='Огр'; ci['81ore_cost'] = 0; ci['81mana_cost'] = 0; ci['81army_cost'] = 6; ci['81action_text'] = '7 урона';
ci['82text'] ='Бешеная овца'; ci['82ore_cost'] = 0; ci['82mana_cost'] = 0; ci['82army_cost'] = 6; ci['82action_text'] = '6 урона, враг теряет 3 отряда';
ci['83text'] ='Черт'; ci['83ore_cost'] = 0; ci['83mana_cost'] = 0; ci['83army_cost'] = 5;  ci['83action_text'] = '6 урона, Все игроки теряют по 5 руды, маны, отрядов';
ci['84text'] ='Жучара'; ci['84ore_cost'] = 0; ci['84mana_cost'] = 0; ci['84army_cost'] = 8; ci['84action_text'] = 'Если стена у врага =0, то 10 урона, иначе 6 урона';
ci['85text'] ='Оборотень'; ci['85ore_cost'] = 0; ci['85mana_cost'] = 0; ci['85army_cost'] = 9; ci['85action_text'] = '9 урона';
ci['86text'] ='Едкое облако'; ci['86ore_cost'] = 0; ci['86mana_cost'] = 0; ci['86army_cost'] = 11;  ci['86action_text'] = 'Если стена врага >10, то 10 урона, иначе 7 урона';
ci['87text'] ='Единорог'; ci['87ore_cost'] = 0; ci['87mana_cost'] = 0; ci['87army_cost'] = 9; ci['87action_text'] = 'Если монастырь больше чем у врага, то 12 урона, иначе 8 урона';
ci['88text'] ='Эльфы-лучники'; ci['88ore_cost'] = 0; ci['88mana_cost'] = 0; ci['88army_cost'] = 10; ci['88action_text'] = 'Если стена больше чем у врага, то 6 урона башне врага, иначе 6 урона';
ci['89text'] ='Суккубы'; ci['89ore_cost'] = 0; ci['89mana_cost'] = 0; ci['89army_cost'] = 14;ci['89action_text'] = '5 урона башне врага, Враг теряет 8 отрядов';
ci['90text'] ='Камнееды'; ci['90ore_cost'] = 0; ci['90mana_cost'] = 0; ci['90army_cost'] = 11;ci['90action_text'] = '8 урона, -1 шахта врага';
ci['91text'] ='Вор'; ci['91ore_cost'] = 0; ci['91mana_cost'] = 0; ci['91army_cost'] = 12;  ci['91action_text'] = 'Враг теряет 10 маны, 5 руды. Вы получаете половину от этого';
ci['92text'] ='Каменный гигант'; ci['92ore_cost'] = 0; ci['92mana_cost'] = 0; ci['92army_cost'] = 15; ci['92action_text'] = '10 урона, +4 к стене';
ci['93text'] ='Вампир'; ci['93ore_cost'] = 0; ci['93mana_cost'] = 0; ci['93army_cost'] = 17;  ci['93action_text'] = '10 урона, враг теряет 5 отрядов, -1 к его казарме';
ci['94text'] ='Дракон'; ci['94ore_cost'] = 0; ci['94mana_cost'] = 0; ci['94army_cost'] = 25;  ci['94action_text'] = '20 урона, враг теряет 10 маны, -1 к его казарме';
ci['95text'] ='Копьеносец'; ci['95ore_cost'] = 0; ci['95mana_cost'] = 0; ci['95army_cost'] = 2;  ci['95action_text'] = 'Если стена больше чем у врага, то 3 урона, иначе 2 урона';
ci['96text'] ='Карлик'; ci['96ore_cost'] = 0; ci['96mana_cost'] = 0; ci['96army_cost'] = 2;  ci['96action_text'] = '3 урона, +1 мана';
ci['97text'] ='Берсерк'; ci['97ore_cost'] = 0; ci['97mana_cost'] = 0; ci['97army_cost'] = 4;  ci['97action_text'] = '8 урона, 3 урона Вашей башне';
ci['98text'] ='Воитель'; ci['98ore_cost'] = 0; ci['98mana_cost'] = 0; ci['98army_cost'] = 13; ci['98action_text'] = '13 урона, вы теряете 3 маны';
ci['99text'] ='Всадник на&nbsp;пегасе'; ci['99ore_cost'] = 0; ci['99mana_cost'] = 0; ci['99army_cost'] = 18;  ci['99action_text'] = '12 урона башне врага';
ci['100text'] ='Призма'; ci['100ore_cost'] = 0; ci['100mana_cost'] = 2; ci['100army_cost'] = 0; ci['100action_text'] = 'Сдать 1 карту, сбросить карту, играем снова'; 
ci['101text'] ='Эльфы-скауты'; ci['101ore_cost'] = 0; ci['101mana_cost'] = 0; ci['101army_cost'] = 2;  ci['101action_text'] = 'Сдать 1 карту, сбросить карту, играем снова'; 
*/
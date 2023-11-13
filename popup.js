const CSL = chrome.storage.local;
const CT = chrome.tabs;
const CR = chrome.runtime;

const addListener = (elem, action, callback) => elem.addEventListener(action, callback);
const getElem = elem => document.getElementById(elem);
const setStorage = obj => CSL.set(obj);
const getStorage = () => new Promise(resolve => CSL.get(null, storage => resolve(storage)));
const Reset = () => location.reload();

const LOGO_ = getElem('logo');
const MAIN_ = getElem('main');
const HELP_ = getElem('help');
const BTN_HELP_ = getElem('btn_help');
const BTN_BACK_ = getElem('btn_back');

const ACTIVE_ = getElem('active');
const KTYPE_ = getElem('ktype');
const GOLDCARD_ = getElem('goldcard');
const AUTOCREATE_ = getElem('autocreate');
const RETURN_ = getElem('return');
const INFO_ = getElem('info');
const STATS_ = getElem('stats');

const KEY_ = getElem('key');
const SENDKEY_ = getElem('sendkey');
const KEYBLOCK_ = getElem('keyblock');
const KEYERROR_ = getElem('keyerror');


LOGO_.innerText += ' ' + chrome.runtime.getManifest().version;

let tabID;


const Run = storage => {

    userID = storage.userID;

    // Блокировка доступа
    if (storage.blocked) return MAIN_.innerHTML = '<p style=margin:10%;>Вам заблокирован доступ к расширению.</p>';

    if (userID == 'default') {
        MAIN_.disabled = true;
        KEYBLOCK_.innerHTML = '';
        LOGO_.insertAdjacentHTML('beforeend', '<span class=err> offline</span>');
    }

    ACTIVE_.checked = storage[userID + '_active'];
    KTYPE_.value = storage[userID + '_ktype'];
    GOLDCARD_.checked = storage[userID + '_goldcard'];
    AUTOCREATE_.checked = storage[userID + '_autocreate'];
    RETURN_.checked = storage[userID + '_return'];
    INFO_.checked = storage[userID + '_info'];
    STATS_.checked = storage[userID + '_stats'];

    const key = storage[userID + "_key"];
    if (key) keyParser(key, storage);
}


/* Обработка функционала ключей */

const keyParser = (key, storage) => {

    /* СТАВКА */

    const BET_ = getElem('bet');
    const userGK = storage.userGK;
    const maxbet = [0, 40, 100, 300, 600, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 10000, 11000, 12000, 20000, 25000, 30000, 35000, 40000, 50000];
    const minIDX = userGK < 5 ? 0 : userGK >= 5 && userGK < 12 ? 1 : 2;
    // формируем список доступных ставок
    maxbet.forEach((bet, i) => {
        if (i >= minIDX && i <= userGK) {
            BET_.innerHTML += `<option ${storage[userID + '_bet'] == i ? 'selected' : ''} value="${i}">${bet}</option>`;
        }
    });

    addListener(BET_, 'change', () => setStorage({ [userID + '_bet']: +BET_.value }));

    /* ПОИСК ЗАЯВОК */

    const CBX_JOINGAME_ = getElem('cbx_joingame');
    const PLIST_ = getElem('pList');
    const INPUTNAME_ = getElem('inputName');
    const BTN_ADDPLAYER_ = getElem('addPlayer');
    const BTN_DELPLAYER_ = getElem('delPlayer');

    CBX_JOINGAME_.checked = storage[userID + '_joingame'];
    addListener(CBX_JOINGAME_, 'change', () => save_options({ [userID + '_joingame']: CBX_JOINGAME_.checked }, { joingame: true, checked: CBX_JOINGAME_.checked }));
    // Загружаем список игроков
    storage[userID + '_plist'].forEach(player => {
        PLIST_.innerHTML += `<option value="${player}">${player}</option>`;
    });

    // Добавление игрока в список
    addListener(BTN_ADDPLAYER_, 'click', async () => {

        const name = INPUTNAME_.value.trim();

        if (name == '') return

        const storage = await getStorage();
        const arr = storage[userID + '_plist'];
        arr.push(name);

        setStorage({ [userID + '_plist']: [...new Set(arr)] });
        Reset();
    });

    // Удаление игрока из списка
    addListener(BTN_DELPLAYER_, 'click', async () => {

        if (PLIST_.selectedIndex == 0) return;

        const name = PLIST_.value;
        const storage = await getStorage();
        const arr = storage[userID + '_plist'].filter(n => n != name);

        setStorage({ [userID + '_plist']: arr });
        Reset();
    });

    /* НАСТРОЙКИ ИИ */

    const CRITPOINT_ = getElem('critPoint');
    const ENEMYCRITPARAMS_ = getElem('enemyCritParams');
    const TOWERSIZE_ = getElem('towerSize');
    const MANAVAL_ = getElem('manaVal');
    const OREVAL_ = getElem('oreVal');
    const BTN_SAVEPARAMS_ = getElem('saveParams');

    CRITPOINT_.value = storage[userID + '_critpoint'];
    TOWERSIZE_.value = storage[userID + '_towersize'];
    MANAVAL_.value = storage[userID + '_manaval'];
    OREVAL_.value = storage[userID + '_oreval'];

    TOWERSIZE_.onkeypress = MANAVAL_.onkeypress = OREVAL_.onkeypress = e => /\d/.test(e.key); // фильтр для чисел

    if (CRITPOINT_.value == 'manual') {
        ENEMYCRITPARAMS_.querySelectorAll('span').forEach(el => el.className = 'title');
        ENEMYCRITPARAMS_.disabled = false;
    }

    addListener(CRITPOINT_, 'change', () => {
        setStorage({ [userID + '_critpoint']: CRITPOINT_.value });
        if (CRITPOINT_.value == 'manual') {
            ENEMYCRITPARAMS_.querySelectorAll('span').forEach(el => el.className = 'title');
            ENEMYCRITPARAMS_.disabled = false;
        } else {
            Reset();
        }
    });

    addListener(BTN_SAVEPARAMS_, 'click', () => {
        if (TOWERSIZE_.value > 199) TOWERSIZE_.value = 199;
        setStorage({ [userID + '_towersize']: +TOWERSIZE_.value, [userID + '_manaval']: +MANAVAL_.value, [userID + '_oreval']: +OREVAL_.value });
    });


    // показываем скрытые поля
    document.querySelectorAll('[data-ext]').forEach(el => el.disabled = false);
    KEYBLOCK_.innerHTML = `<p class=work>ID ${userID} : key ${key}</p>`; // выводим значение текущего ключа
}


/* Обработка взаимодействия с интерфейсом */

addListener(SENDKEY_, 'click', () => {
    if (KEY_.value) {
        CR.sendMessage({ 'verifykey': KEY_.value });
        SENDKEY_.disabled = true;
    }
});


CT.query({ active: true, currentWindow: true }, tabs => {
    tabID = tabs[0].id;
});

addListener(ACTIVE_, 'change', () => save_options({ [userID + '_active']: ACTIVE_.checked }));
addListener(KTYPE_, 'change', () => setStorage({ [userID + '_ktype']: KTYPE_.value }));
addListener(GOLDCARD_, 'change', () => setStorage({ [userID + '_goldcard']: GOLDCARD_.checked }));
addListener(AUTOCREATE_, 'change', () => save_options({ [userID + '_autocreate']: AUTOCREATE_.checked }, { autocreate: true, checked: AUTOCREATE_.checked }));
addListener(RETURN_, 'change', () => setStorage({ [userID + '_return']: RETURN_.checked }));
addListener(INFO_, 'change', () => save_options({ [userID + '_info']: INFO_.checked }));
addListener(STATS_, 'change', () => save_options({ [userID + '_stats']: STATS_.checked }));

addListener(BTN_HELP_, 'click', () => {
    MAIN_.style.display = 'none';
    HELP_.style.display = 'block'
});

addListener(BTN_BACK_, 'click', () => {
    Reset();
});


const save_options = (obj, params = { reload: true }) => {
    setStorage(obj);
    //перезагружаем content
    CT.sendMessage(tabID, params);
}

CR.onMessage.addListener((request, sender, response) => {
    if (request.popup == 'keyreject') {
        SENDKEY_.disabled = false;
        KEY_.value = '';
        KEYERROR_.innerHTML = 'Неверный ключ активации';
    }

    if (request.popup == 'keyaccept') {
        KEYBLOCK_.innerHTML = '<p class=work>Ваш ключ успешно активирован! Обновление данных...</p>'
        setTimeout(Reset, 3000);
    }

    response(true);
});

// Старт
addListener(document, 'DOMContentLoaded', async () => {
    const storage = await getStorage();
    Run(storage);
});
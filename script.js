// Функция для получения списка валют
async function fetchCurrencies() {
    const appId = "ТВОЙ_APP_ID"; // Замени на свой App ID
    const url = `https://openexchangerates.org/api/currencies.json?app_id=${appId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Ошибка загрузки валют");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Ошибка:", error);
        return null;
    }
}

// Функция для получения курсов валют
async function fetchRates() {
    const appId = "c50d02ee38d64c78811f97ee5deb3903"; // Замени на свой App ID
    const url = `https://openexchangerates.org/api/latest.json?app_id=${appId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Ошибка API: " + response.status);
        const data = await response.json();
        return data.rates;
    } catch (error) {
        console.error("Ошибка при загрузке курсов:", error);
        return null;
    }
}

// Функция для получения курсов с кэшированием
async function getCachedRates() {
    const cached = localStorage.getItem("rates");
    const lastUpdate = localStorage.getItem("lastUpdate");
    const now = Date.now();

    if (cached && lastUpdate && (now - lastUpdate < 3600000)) {
        return JSON.parse(cached);
    }

    const rates = await fetchRates();
    if (rates) {
        localStorage.setItem("rates", JSON.stringify(rates));
        localStorage.setItem("lastUpdate", now);
    }
    return rates;
}

// Функция для заполнения выпадающих списков валютами
async function populateCurrencies() {
    const fromSelect = document.getElementById("fromCurrency");
    const toSelect = document.getElementById("toCurrency");
    const currencies = await fetchCurrencies();

    if (!currencies) {
        fromSelect.innerHTML = "<option>Ошибка загрузки валют</option>";
        toSelect.innerHTML = "<option>Ошибка загрузки валют</option>";
        return;
    }

    // Очищаем списки
    fromSelect.innerHTML = "";
    toSelect.innerHTML = "";

    // Заполняем списки всеми валютами
    for (const code in currencies) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = `${code} - ${currencies[code]}`;
        fromSelect.appendChild(option.cloneNode(true));
        toSelect.appendChild(option);
    }

    // Устанавливаем значения по умолчанию (например, USD и EUR)
    fromSelect.value = "USD";
    toSelect.value = "EUR";
}

// Функция конвертации валют
async function convertCurrency() {
    const amount = document.getElementById("amount").value;
    const fromCurrency = document.getElementById("fromCurrency").value;
    const toCurrency = document.getElementById("toCurrency").value;
    const result = document.getElementById("result");

    if (amount === "" || amount <= 0) {
        result.textContent = "Пожалуйста, введите корректную сумму.";
        return;
    }

    const rates = await getCachedRates();
    if (!rates) {
        result.textContent = "Не удалось загрузить курсы валют.";
        return;
    }

    if (!rates[fromCurrency] || !rates[toCurrency]) {
        result.textContent = "Выбранная валюта недоступна.";
        return;
    }

    const amountInUSD = amount / rates[fromCurrency];
    const convertedAmount = (amountInUSD * rates[toCurrency]).toFixed(2);
    result.textContent = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
}

// Инициализация при загрузке страницы
window.onload = function() {
    populateCurrencies(); // Загружаем валюты при старте
};
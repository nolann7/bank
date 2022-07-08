'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2022-07-02T14:11:59.604Z',
    '2022-07-03T17:01:17.194Z',
    '2022-07-06T23:36:17.929Z',
    '2022-07-07T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const calcFormattedDateOutput = (past, locale) => {
  const now = new Date();
  const days = Math.round(Math.abs(+now - +past) / (1000 * 60 * 60 * 24));

  const displayDate = Intl.DateTimeFormat(locale).format(past);

  return days < 1
    ? `today`
    : days < 2
    ? `yesterday`
    : days <= 7
    ? `${days} days ago`
    : displayDate;
};

const formattedCur = (value, locale, currency) => {
  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);

    const displayDaysAgo = calcFormattedDateOutput(date, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDaysAgo}</div>
        <div class="movements__value">${formattedCur(
          Math.abs(mov),
          acc.locale,
          acc.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formattedCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${formattedCur(incomes, acc.locale, acc.currency)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = `${formattedCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = `${formattedCur(
    interest,
    acc.locale,
    acc.currency
  )}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const startLogOutTimer = function () {
  let time = 600;
  const tick = () => {
    let min = String(Math.trunc(time / 60)).padStart(2, '0');
    let sec = String(time % 60).padStart(2, '0');

    labelTimer.textContent = `${min}:${sec}s`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  };
  let timer = setInterval(tick, 1000);
  return timer;
};

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;
let timer;

/* // Fake always login
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100; */

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    // dateDisplay
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: '2-digit',
      month: 'numeric',
      year: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Set LogOutTimer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // adding date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputLoanAmount.value;

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);
      // Add date
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);
    }, 2000);
  }
  inputLoanAmount.value = '';

  // Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//https://developer.mozilla.org/ru/docs/Web/API/setTimeout
setTimeout(() => console.log('Here is your pizza'), 2000); // callback function will execute in 2 sec
setTimeout(() => console.log('And here is your cola'), 3400);
console.log('Waiting...'); // будет выполнено перед двумя предыдущими log-ами, потому что JS не останавливается, видя setTimeout функцию, а просто регистрирует кол бэк функцию, и таймер и идет дальше выполнять код  - этот механизм называется асинхронный JS. (async) - об этом больше позже

/*



// SetTimeout  - выполняет колбэк функцию после заданного количества времени
setTimeout(
  (ing1, ing2) =>
    console.log(`Here is your pizza with ${ing1} and ${ing2}. Enjoy:)`),
  4000,
  'olives',
  'spinach'
); // таким образом можно передавать параметры в нашу кол-бэк функцию из setTimeout функции */
/* 
const ingridients = ['olives', 'spinach', 'pineapple'];
const pizzaTimer = setTimeout(
  (ing1, ing2) =>
    console.log(`Here is your pizza with ${ing1} and ${ing2}. Enjoy:)`),
  3000,
  [...ingridients]
); // и деструктуризацией можно передавать параметры в нашу кол-бэк функцию из setTimeout функции

if (ingridients.includes('pineapple')) clearTimeout(pizzaTimer); // функция выполнена не будет, так как условие true, и clearTimeout удалит наш setTimeout */

// setInterval
/* setInterval(() => {
  const now = new Date();
  console.log(now);
}, 3000); // каждые 3 секунды выполняется колбэк функция снова и снова
 */
/* 
setInterval(() => {
  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };
  console.log(Intl.DateTimeFormat('uk-UA', options).format(now));
}, 1000); */

/* //https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat

const num = 1345254.231;
const options = {
  style: 'unit',
  unit: 'mile-per-hour',
};
console.log(new Intl.NumberFormat('en-US', options).format(num)); // 1,345,254.231 mph
console.log(new Intl.NumberFormat('de-DE', options).format(num)); // 1.345.254,231 mi/h
console.log(new Intl.NumberFormat('uk-UA', options).format(num)); // 1 345 254,231 милі/год
console.log(new Intl.NumberFormat('ar-SY', options).format(num)); // ١٬٣٤٥٬٢٥٤٫٢٣١ ميل/س
console.log(new Intl.NumberFormat(navigator.language, options).format(num)); // 1 345 254,231 ми/ч

const opt = {
  style: 'currency',
  currency: 'EUR',
};
console.log(new Intl.NumberFormat('en-US', opt).format(num)); // €1,345,254.23
console.log(new Intl.NumberFormat('de-DE', opt).format(num)); // 1.345.254,23 €
console.log(new Intl.NumberFormat('uk-UA', opt).format(num)); // 1 345 254,23 EUR
 */
/* //https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
// http://www.lingoes.net/en/translator/langcode.htm
const now = new Date();
const cool = new Intl.DateTimeFormat('en-GB').format(now);
console.log(cool); //07/07/2022

console.log(new Intl.DateTimeFormat('en-US').format(now)); // 7/7/2022
console.log(new Intl.DateTimeFormat('uk-UA').format(now)); // 07.07.2022

const options = {
  // можно добавлять/убирать любые параметры и задавать их в любом виде
  hour: 'numeric',
  minute: 'numeric',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  weekday: 'short',
};
console.log(new Intl.DateTimeFormat('uk-UA', options).format(now)); // чт, 07 липня 2022 р. о 20:01

//https://developer.mozilla.org/ru/docs/Web/API/Navigator
const local = navigator.language; // берем локализацию из браузера юзера
const locale = navigator.language ? navigator.language : 'en-US'; // проверяем доступен ли язык, если нет - ставим en
console.log(locale); //ru-RU

console.log(new Intl.DateTimeFormat(locale, options).format(now)); // чт, 07 июля 2022 г., 20:07
 */
/* 
const future = new Date(2037, 10, 19, 15, 23);
const now = new Date();
console.log(+future);
console.log(+now);
const myBirthday = new Date(1993, 3, 22);
console.log(myBirthday);

// function for finding how many days passed beetwen two dates

// const calcDaysBetweenDates = (date1, date2 = new Date()) =>
//   Math.round(Math.abs(+date2 - +date1) / (1000 * 60 * 60 * 24));
// console.log(calcDaysBetweenDates(myBirthday)); //10669 */

/*
//all numbers in JS are float numbers
console.log(23 === 23.0); //true

// numbers in JS representet in 64 base 2 format
// base 10  -> 0...9
// base 2  -> 0 1

//this results to:
console.log(0.1 + 0.2); //0.30000000000000004
console.log(0.1 + 0.2 === 0.3); //false

//thats why we can`t use JS for really precise calculations

//convert string to number:
console.log(Number('23')); // 23  (as a number)
console.log(+'23'); //23  -тоже самое что и выше, JS делает type coercion с помощью плюса строки в числа

// parsing string to numbers:  (можно все эти методы Number вызывать и без Number, так как они глобальны, но не желательно!)

//Number.parseInt
console.log(Number.parseInt('  23px  ', 10)); //23  - вторым аргументом указываем в какой мы чиловой системе десятичной в данном случае. (необязательно но желательно)
console.log(Number.parseInt('e23', 10)); // NaN  - строка должна начинаться с числа

// Numbers.parseFloat
console.log(Number.parseFloat(' 2.5rem')); // 2.5
console.log(Number.parseInt(' 2.5rem')); // 2

// Number.isNaN  - check if this value is NaN (Not a Number)
console.log(Number.isNaN(23)); // false  - потому что это число
console.log(Number.isNaN('23')); // false - потому что это строка, а не Not a Number (NaN)
console.log(Number.isNaN(+'23X')); // true - потому что мы попытались перевести строку в число и это не получилось сделать. 
console.log(+'23X'); //NaN
console.log((Number.isNaN(23 / 0)));  // false - потому что value деления на ноль - infinity, а не NaN

// Number.isFinite  - best way of checking is value IS a Number
console.log(Number.isFinite(23)); // true
console.log(Number.isFinite('23')); // false  - потому что строка
console.log(Number.isFinite(+'23X')); // false   - потому что NaN
console.log((Number.isFinite(23 / 0)));  // false  - потому что infinity

// Number.isInteger  - если мы уверены что наше число integer - можно использовать. checking is value IS integer
console.log(Number.isInteger(23));  //true
console.log(Number.isInteger(23.0)); //true
console.log(Number.isInteger(23.01)); //false
console.log(Number.isInteger(23/0)); //false
console.log(Number.isInteger(+'23')); //true
console.log(Number.isInteger(+'23X')); //false
*/
/*
// Math.sqrt - квадратный корень
console.log(Math.sqrt(25)); // 5
console.log(25 ** (1 / 2)); // 5
console.log(25 ** 0.5); // 5
console.log(8 ** (1 / 3)); // 2  - кубический корень

// Math.max   - return max value (does type coersing, but does not parsing)
console.log(Math.max(2, 5, 6, 7, 23, 5, 4, 9)); // 23
console.log(Math.max(2, 5, 6, 7, '23', 5, 4, 9)); // 23
console.log(Math.max(2, 5, 6, 7, '23px', 5, 4, 9)); // NaN

// Math.min  - the same as max
console.log(Math.min(2, 5, 6, 7, '23', 5, 4, 9)); // 2

// Math.PI
console.log(Math.PI); // 3.141592653589793
console.log(Math.PI * parseInt('10px') ** 2); // 314.1592653589793    - считаем площадь круга зная радиус

// Math.random   - возвращает значения от 0 до 1 (не включительно) каждый раз рандомно
console.log(Math.trunc(Math.random() * 6) + 1); // 1...6 рандомно

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min; // функция для рандомных чисел между мин и макс

// Rounding integers
console.log(Math.trunc(23.3)); // 23 - просто обрезает всё после запятой
console.log(Math.trunc(-23.3)); // -23 - просто обрезает всё после запятой

console.log(Math.round(23.3)); // 23  - округление по правилам математики
console.log(Math.round('23.5')); // 24
console.log(Math.round(23.9)); // 24

console.log(Math.ceil(23.3)); // 24  - округление к верху (потолку)
console.log(Math.ceil(23.9)); // 24
console.log(Math.ceil(-23.9)); // 23

console.log(Math.floor('23.3')); // 23  - окргуление к низу (полу)
console.log(Math.floor(23.9)); // 23
console.log(Math.floor(-23.9)); // 24

// Rounding decimals

// .toFixed()  -  аргумент указывает до скольки знаков после запятой нужно округлить (округляет по правилам математики) и возвращает строку!!

console.log('------------');
console.log((2.7).toFixed());  // '3'  по умолчанию 0 
console.log(+(2.7).toFixed(3)); // 2.700
console.log(+(2.345).toFixed(2)); // 2.35
console.log(+(-2.345).toFixed(2)); // -2.35
*/
/* 
// remainder -остаток от деления (див)  - %
console.log(5 % 2); // 1
// 5 == 2 * 2 + 1

console.log(8 % 3); // 2
//  8 ==  2 * 3 + 2

// const isEven = n => (n % 2 === 0 ? true : false);
const isEven = n => n % 2 === 0; // тоже самое что и выше потому что вернется true если выражение правда и ложь, если ложь
console.log(isEven(4670)); //true
console.log([...document.querySelectorAll('.movements__row')]);
labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    console.log(row);
  });
});
 */
/* 
// 287,460,000,000 == 287_460_000_000 - можно использовать _ для визуального понимания больших чисел, JS это понимает и обрабатывает правильно
// _ можно использовать только между цифр в числе, нельзя вокруг точки или перед/после числа
const diametr = 287_460_000_000;
console.log(diametr);  // 287460000000

const priceInCents = 23_99;
console.log(priceInCents); // 2399

console.log(+('230000')); // 230000
console.log(+('230_000')); // NaN   - нельзя использовать в строках, которые приводим к числу
console.log(parseInt('230_000')); // 230 */
/* 
//https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER

console.log(2 ** 53 - 1); // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991

//https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/BigInt
// create BigInt
console.log(52974308982734598274369822389459283n); // 52974308982734598274369822389459283n  - этот способ работает хорошо с любыми числами
console.log(BigInt(52974308982734598274369822389459283)); // 52974308982734594725015472335486976n - этот плохо с очень большими
console.log(BigInt(29437656752)); // 29437656752n  - с маленькими хорошо работает
console.log(BigInt('9007199254740991')); //9007199254740991n
console.log(BigInt('0x1fffffffffffff')); //9007199254740991n
console.log(BigInt('0b11111111111111111111111111111111111111111111111111111')); //9007199254740991n
console.log(5n / 2n); //2n  - bigint не поддержвивает дробные значения, будет округляться в меньшую сторону
console.log(0n === 0); // false
console.log(0n == 0); // true
console.log(2n > 1); // true  - обычные числа и бигинт можно сравнивать как обычно

// Operations (как с обычными числами, только нельзя смешивать BigInt с обычными)
//Операторы
// Следующие операторы могут использоваться с BigInt (или объектом-обёрткой BigInt): +, *, -, **, %.
console.log(1000000n + 1893726516835n); //1893727516835n
console.log(
  243875208934672098467208943670289467240896n *
    2093487652984375928043752984375298437n
); // 510549738773720997931962056988122090535528296859391288198928127226734971279552n

// console.log(274627894628047620983467n * 23); //error
// console.log(Math.sqrt(16n)); // error     - Math operators не поддерживают бигинт
console.log(274627894628047620983467n * 23n); // 6316441576445095282619741n

// Exceptions:
console.log(20n > 15); //true
console.log(20n === 20); //false
console.log(20n == 20); //true

console.log(2439876523874652873465298345n + ' IS really BIG!!'); //2439876523874652873465298345 IS really BIG!!

// Divisions
console.log(11n / 3n); // 3n   - обрезает значения после запятой
 */
/* 
//Create a date
const now = new Date();
console.log(now); // Thu Jul 07 2022 09:39:21 GMT+0300 (Восточная Европа, летнее время)

console.log(new Date('Aug 02 2022 18:05:40')); // Tue Aug 02 2022 18:05:40 GMT+0300 (Восточная Европа, летнее время)
console.log(new Date('Decemder 24, 2015')); // Thu Dec 24 2015 00:00:00 GMT+0200 (Восточная Европа, стандартное время)
console.log(new Date(account1.movementsDates[0])); // Mon Nov 18 2019 23:31:17 GMT+0200 (Восточная Европа, стандартное время)

console.log(new Date(2022, 6, 7, 9, 45)); // Thu Jul 07 2022 09:45:00 GMT+0300 (Восточная Европа, летнее время)
console.log(new Date(2022, 6)); // Fri Jul 01 2022 00:00:00 GMT+0300 (Восточная Европа, летнее время)

console.log(new Date(0)); // Thu Jan 01 1970 03:00:00 GMT+0300 (Восточная Европа, стандартное время)
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Sun Jan 04 1970 03:00:00 GMT+0300 (Восточная Европа, стандартное время)
 */
/* // Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future); //Thu Nov 19 2037 15:23:00 GMT+0200 (Восточная Европа, стандартное время)
console.log(future.getFullYear()); // 2037
console.log(future.getMonth()); // 10   - месяцы начинаются с 0
console.log(future.getDate()); // 19
console.log(future.getDay()); // 4   - день недели начинается с 0 с Sunday, 4 - четверг
console.log(future.getHours()); // 15
console.log(future.getMinutes()); // 23
console.log(future.getSeconds()); // 0
console.log(future.getMilliseconds()); // 0

console.log(future.toISOString()); // 2037-11-19T13:23:00.000Z
console.log(future.getTime()); // 2142249780000   - количество милисекунд с 1970 года по заданную дату
console.log(new Date(2142249780000)); // Thu Nov 19 2037 15:23:00 GMT+0200 (Восточная Европа, стандартное время)

console.log(Date.now());  //  1657177350584

// для всех этих методов есть set 
future.setFullYear(2040);
console.log(future);  // Mon Nov 19 2040 15:23:00 GMT+0200 (Восточная Европа, стандартное время)
 */

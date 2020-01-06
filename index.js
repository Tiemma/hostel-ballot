const puppeteer = require('puppeteer');
const fields = require('./fields');
const options = require('./puppeteer_options');

require('dotenv').config();

console.log(fields);
console.log(options);

let delay = 0;

(async () => {
    const browser = await puppeteer.launch({
        timeout: options.timeout, headless: options.headless, userDataDir: `${options.userDataDir}-${Math.floor(Math.random() * 4)}`, args: [
            '--load-extension=./chrome_extension/',
            '--disable-extensions-except=./chrome_extension/'
        ]
    });

    let page = await browser.newPage();

    await page.setJavaScriptEnabled(options.javascriptEnabled);

    await page.setCacheEnabled(options.cacheEnabled);

    await page.goto('http://accommodation.unilag.edu.ng/', {timeout: options.timeout});

    await page.click(fields.LOGIN_USERNAME_ID);
    await page.keyboard.type(process.env.MATRIC_NO);

    await page.click(fields.LOGIN_PASSWORD_ID);
    await page.keyboard.type(process.env.PASSWORD);

    await page.click(fields.BUTTON_SELECTOR);

    await page.waitForNavigation({timeout: options.timeout, waitUntil: options.waitUntil});

    let count = 1;

    let delay = 10000;

    while(true) {

        const hall = options.halls[Math.floor(Math.random() * options.halls.length)];

        const hallId = await page.url().split('/').splice(0, 4).join('/') + `/AccommodationReservation.aspx?hallid=${hall}&room=`;

        console.log("Hall is: " + hall + " " + hallId);

        await page.goto(hallId, {timeout: options.timeout});

        await page.waitForSelector(fields.BALLOT_SUBMIT_BUTTON, {timeout: options.timeout});

        await page.click(fields.BALLOT_SUBMIT_BUTTON);

        // await page.waitForNavigation({timeout: options.timeout, waitUntil: options.waitUntil});

        await page.waitForSelector(fields.ERROR_DIV, {timeout: options.timeout});

        const spaceFree = await page.evaluate(() => document.querySelector('#errordiv').textContent);

        console.log(`Answer for request ${count} is ${spaceFree}`);

        count++;

        if (!spaceFree.includes('Sorry')) {
            throw new Error('Space acquired');
        }


        if (delay > 100000){
            delay = 10000;
        }

        setTimeout(async () => {
            await page.goto(hallId, {timeout: options.timeout});

            await page.click(fields.BALLOT_SUBMIT_BUTTON);
        }, delay+=10000);
    }

})();




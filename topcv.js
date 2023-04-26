const puppeteer = require('puppeteer');
const database = require("./db");

// Open db
let db;
let startPage = 1;

const urlCrawl = 'https://www.topcv.vn/viec-lam-it/';

async function crawlData() {
    if (typeof (startPage) == 'undefined' || isNaN(startPage)) {
        startPage = 1;
    }
    if (startPage == 1) {
        // Open db
        db = database.connectToDatabase();
        // Create table if not exists
        database.createTopCVTable(db);
    }
    const urlPage = urlCrawl + '?page=' + startPage;
    console.log('-----------------------------');
    console.log(urlPage);

    // Create an instance of the chrome browser
    const browser = await puppeteer.launch();

    // Create a new page
    const page = await browser.newPage();

    // Configure the navigation timeout
    await page.goto(urlPage, {
        waitUntil: 'load',
        // Remove the timeout
        timeout: 0
    });

    // Wait for the page to load
    await page.waitForSelector('title');

    const elements = await page.$$('.job-list-2 .job-item-2');
    const arr = [];
    const listPages = await page.$$('.job-body .pagination li');
    let elementTotalPage = await listPages[listPages.length - 2].$('a');
    let totalPage = 0;
    if (!elementTotalPage) {
        elementTotalPage = await listPages[listPages.length - 2].$('a');
    }
    totalPage = await page.evaluate(el => el.textContent, elementTotalPage);

    console.log(totalPage);

    for (let i = 0; i < elements.length; i++) {
        try {

            const url = await elements[i].$('.job-list-2 .job-item-2 .box-header .body .title a');
            const urlText = await page.evaluate(el => el.getAttribute('href'), url);

            const jobTitleText = await page.evaluate(el => el.textContent, url);

            const image = await elements[i].$('.job-list-2 .job-item-2 .box-header .avatar img');
            const imageSrc = await page.evaluate(el => el.getAttribute('src'), image);

            const companyName = await elements[i].$('.job-list-2 .job-item-2 .box-header .body .company');
            const companyNameText = await page.evaluate(el => el.textContent, companyName);
            const companyUrl = await page.evaluate(el => el.getAttribute('href'), companyName);

            const companyLocation = await elements[i].$('.job-list-2 .job-item-2 .box-info .label-content .address');
            const companyLocationText = await page.evaluate(el => el.textContent, companyLocation);

            const salary = await elements[i].$('.job-list-2 .job-item-2 .box-header .body .title-salary');
            const salaryText = await page.evaluate(el => el.textContent, salary);

            const date = await elements[i].$('.job-list-2 .job-item-2 .box-info .label-content .time');
            let dateText = await page.evaluate(el => el.textContent, date);
            dateText = parseInt(dateText.replace(/\D/g, ''));
            const currentDate = new Date();
            const expiredDate = new Date(currentDate);
            expiredDate.setDate(currentDate.getDate() + dateText);

            const englishRequireSkills = await elements[i].$('.job-list-2 .job-item-2 .skills');
            let englishRequire = 0;
            if (typeof (englishRequireSkills) != 'undefined') {
                englishRequire = 1;
            }

            const bulkData = await elements[i].$('.job-list-2 .job-item-2 .box-header .body .box-label-top .label-quantity');
            let isBulk = 0;
            if (typeof (bulkData) != 'undefined') {
                isBulk = 1;
            }

            if (typeof (urlText) != 'undefined') {
                let row = [
                    urlText,
                    jobTitleText,
                    imageSrc,
                    companyNameText,
                    companyLocationText,
                    companyUrl,
                    salaryText,
                    isBulk,
                    englishRequire,
                    expiredDate
                ];
                arr.push(row);
            }

            if (arr.length > 0) {
                // Insert or update
                database.insertOrUpdateTopCVTable(db, arr);
            }

            // console.log(arr);

        } catch (error) {
            // console.log(error);
            console.log(`error`);
        }

    }

    await browser.close();

    if (startPage < totalPage) {
        startPage++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        crawlData();
    } else {
        // Close db
        database.closeDatabase(db);
    }
}

crawlData();

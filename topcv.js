const puppeteer = require('puppeteer');
const database = require("./db");

// Open db
let db;
let startPage = 1;

const urlCrawl = 'https://www.topcv.vn/viec-lam-it/';

async function crawlData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set a custom user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

    if (typeof (startPage) == 'undefined' || isNaN(startPage)) {
        startPage = 1;
    }
    if (startPage == 1) {
        // Open db
        db = database.connectToDatabase();
        // Create table if not exists
        database.createJobTable(db);
    }
    const urlPage = urlCrawl + '?page=' + startPage;
    console.log('-----------------------------');
    console.log(urlPage);

    // Go to the page need to crawl
    await page.goto(urlPage);

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

            const url = await elements[i].$('.resultContent .jobTitle .jcs-JobTitle');
            const urlText = await page.evaluate(el => el.getAttribute('href'), url);

            const jobTitle = await elements[i].$('.resultContent .jobTitle .jcs-JobTitle');
            const jobTitleText = await page.evaluate(el => el.textContent, jobTitle);

            const companyName = await elements[i].$('.resultContent .companyName');
            const companyNameText = await page.evaluate(el => el.textContent, companyName);

            const companyLocation = await elements[i].$('.resultContent .companyLocation');
            const companyLocationText = await page.evaluate(el => el.textContent, companyLocation);

            const salary = await elements[i].$('.resultContent .metadataContainer.salaryOnly');
            const salaryText = await page.evaluate(el => el.textContent, salary);

            const description = await elements[i].$('.underShelfFooter .result-footer .job-snippet');
            const descriptionText = await page.evaluate(el => el.textContent, description);

            const date = await elements[i].$('.underShelfFooter .result-footer .date');
            const dateText = await page.evaluate(el => el.textContent, date);

            if (typeof (urlText) != 'undefined') {
                let row = [
                    urlText,
                    jobTitleText,
                    companyNameText,
                    companyLocationText,
                    salaryText,
                    descriptionText,
                    dateText
                ];
                arr.push(row);
            }

            if (arr.length > 0) {
                // Insert db
                database.insertOrUpdateJobTable(db, arr);
            }

            // console.log(arr);

        } catch (error) {
            console.log(`catch`);
            //console.log(error);
        }

    }


    await browser.close();

    if (startPage < totalPage) {
        startPage++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        crawlData(keyword);
    } else {
        // Close db
        database.closeDatabase(db);
    }
}

crawlData();

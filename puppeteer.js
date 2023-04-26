const puppeteer = require('puppeteer');
const database = require("./db");

// Open db
let db;
let startPage = 0;

const urlCrawl = 'https://vn.indeed.com/jobs?q=';

async function crawlData(keyword) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set a custom user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

    if (typeof (startPage) == 'undefined' || isNaN(startPage)) {
        startPage = 0;
    }
    if (startPage == 0) {
        // Open db
        db = database.connectToDatabase();
        // Create table if not exists
        database.createJobTable(db);
    }
    const urlPage = urlCrawl + keyword + '&start=' + (startPage * 10);
    console.log('-----------------------------');
    console.log(urlPage);

    // 
    await page.goto(urlPage);

    // Wait for the page to load
    await page.waitForSelector('title');

    const elements = await page.$$('.mosaic-provider-jobcards ul.jobsearch-ResultsList>li');
    const arr = [];
    const totalItems = await page.$('.jobsearch-JobCountAndSortPane-jobCount');
    let totalItemsNumber = await page.evaluate(el => el.textContent, totalItems);
    totalItemsNumber = parseInt(totalItemsNumber.replace(/\D/g, ''));
    const totalPage = Math.ceil(totalItemsNumber / 15) + 1;
    console.log(`------------------------------------`);
    console.log(`Total Page: ` + totalPage);

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

// Initial
// crawlData('t%E1%BA%A1i+nh%C3%A0+online');

module.exports = {
    crawlData: crawlData,
    startPage: startPage,
};
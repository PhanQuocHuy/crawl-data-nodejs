// Write Javascript code here
const request = require('request');
const cheerio = require('cheerio');
const database = require("./db");

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36',
];

const REFERERS = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://www.yahoo.com/',
];

const ACCEPT_LANGUAGES = [
    'en-US,en;q=0.9',
    'en-GB,en;q=0.8',
    'en;q=0.7',
];

const urlCrawl = 'https://vn.indeed.com/jobs?filter=0&q=';
const startPage = 0;

function callCrawlRecursive(keyword, startPage) {
    if (typeof (startPage) == 'undefined' || isNaN(startPage)) {
        startPage = 0;
    }
    const url = urlCrawl + keyword + '&start=' + (startPage * 10);
    console.log(url);
    const options = {
        url: url,
        headers: {
            'User-Agent': 'request',
            'Referer': REFERERS[Math.floor(Math.random() * REFERERS.length)],
            'Accept-Language': ACCEPT_LANGUAGES[Math.floor(Math.random() * ACCEPT_LANGUAGES.length)],
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };

    request(options, function (err, res, body) {
        if (!err && res.statusCode != 200) {
            console.log(res.statusCode);
        }
        else {
            const arr = [];
            let $ = cheerio.load(body);
            $('.mosaic-provider-jobcards ul.jobsearch-ResultsList>li').each(function (index) {
                const url = $(this).find('.resultContent .jobTitle .jcs-JobTitle').attr('href');
                const name = $(this).find('.resultContent .jobTitle .jcs-JobTitle').text();
                const companyName = $(this).find('.resultContent .companyName').text();
                const companyLocation = $(this).find('.resultContent .companyLocation').text();
                const salary = $(this).find('.resultContent .metadataContainer.salaryOnly').text();

                const description = $(this).find('.underShelfFooter .result-footer .job-snippet').text();
                const date = $(this).find('.underShelfFooter .result-footer .date').text();

                if (typeof (url) != 'undefined') {
                    const row = [
                        url,
                        name,
                        companyName,
                        companyLocation,
                        salary,
                        description,
                        date
                    ];
                    arr.push(row);
                }
            });

            if (arr.length > 0) {
                // Open connect
                const db = database.connectToDatabase();
                // Create table if not exists
                database.createJobTable(db);
                // Insert db
                database.insertJobTable(db, arr);
                // Close db
                database.closeDatabase(db);
                console.log("Finished writing data");
            } else {
                console.log("No data");
            }

            if (startPage < 60) {
                setTimeout(() => {
                    startPage++;
                    callCrawlRecursive(keyword, startPage);
                }, 1000); // wait 1 second before calling countdown again
            }
        }
    });

}

callCrawlRecursive('t%E1%BA%A1i+nh%C3%A0+online', startPage);

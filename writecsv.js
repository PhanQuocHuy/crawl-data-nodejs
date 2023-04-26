// Write Javascript code here
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const db = require("./db");

const options = {
    url: 'https://vn.indeed.com/jobs?q=t%E1%BA%A1i+nh%C3%A0+online',
    headers: {
        'User-Agent': 'request',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
};

request(options, function (err, res, body) {
    if (!err && res.statusCode != 200) {
        console.log(body);
    }
    else {
        const arr = [];
        const filename = "job.csv";
        const writableStream = fs.createWriteStream(filename);

        const columns = [
            "url",
            "name",
            "company_name",
            "company_location",
            "salary",
            "description",
            "post_date",
        ];
        const stringifier = stringify({ header: true, columns: columns });

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
                // Save to CSV
                stringifier.write(row);
                // Save to database
                db.serialize(function () {
                    db.run(
                        `INSERT INTO job VALUES (?, ?, ? , ?, ?, ?, ?)`,
                        [row[0], row[1], row[2], row[3], row[4], row[5], row[6]],
                        function (error) {
                            if (error) {
                                return console.log(error.message);
                            }
                            console.log(`Inserted a row with the id: ${this.lastID}`);
                        }
                    );
                });
                console.log(row);
            }
        });
        if (arr.length > 0) {
            stringifier.pipe(writableStream);
            console.log("Finished writing data");
        } else {
            console.log("No data");
        }
    }
});

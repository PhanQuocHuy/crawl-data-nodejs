const sqlite3 = require("sqlite3").verbose();

function connectToDatabase() {
    let db = new sqlite3.Database('./job.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to the database successfully");
    });

    return db;
}

function closeDatabase(db) {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}

function createJobTable(db) {
    db.exec(`
                CREATE TABLE IF NOT EXISTS job
                (
                    url                 VARCHAR(250),
                    name                VARCHAR(250),
                    company_name        VARCHAR(250),
                    company_location    VARCHAR(500),
                    salary              VARCHAR(50),
                    description         VARCHAR(500),
                    post_date           VARCHAR(50)
                )
            `);
}

function insertOrUpdateJobTable(db, collection) {
    collection.forEach(row => {
        db.serialize(function () {
            // select a row from a table
            db.get('SELECT rowid FROM job WHERE url = ?', [row[0]], (error, item) => {
                if (error) {
                    return console.log(error);
                }
                if (item == false || item == null) {
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
                } else {
                    db.run(
                        `UPDATE job SET url = ?, name = ?, company_name = ?, company_location = ?, salary = ?, description = ?, post_date = ? WHERE rowid = ?`,
                        [row[0], row[1], row[2], row[3], row[4], row[5], row[6], item.rowid],
                        function (error) {
                            if (error) {
                                return console.log(error.message);
                            }
                            console.log(`Updated a row with the id: ${item.rowid}`);
                        }
                    );
                }
            });
        });
    });
}

function createTopCVTable(db) {
    db.exec(`
                CREATE TABLE IF NOT EXISTS topcv
                (
                    url                 VARCHAR(250),
                    name                VARCHAR(250),
                    image               VARCHAR(250),
                    company_name        VARCHAR(250),
                    company_location    VARCHAR(500),
                    company_url         VARCHAR(250),
                    salary              VARCHAR(50),
                    is_bulk             INTEGER,
                    english_require     INTEGER,
                    last_apply          DATE
                )
            `);
}

function insertOrUpdateTopCVTable(db, collection) {
    collection.forEach(row => {
        db.serialize(function () {
            // select a row from a table
            db.get('SELECT rowid FROM topcv WHERE url = ?', [row[0]], (error, item) => {
                if (error) {
                    return console.log(error);
                }
                if (item == false || item == null) {
                    db.run(
                        `INSERT INTO topcv VALUES (?, ?, ?, ? , ?, ?, ?, ?, ?, ?)`,
                        [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9]],
                        function (error) {
                            if (error) {
                                return console.log(error.message);
                            }
                            console.log(`Inserted a row with the id: ${this.lastID}`);
                        }
                    );
                } else {
                    db.run(
                        `UPDATE topcv SET url = ?, name = ?, image = ?, company_name = ?, company_location = ?, company_url = ?, salary = ?, is_bulk = ?, english_require = ? , last_apply = ? WHERE rowid = ?`,
                        [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], item.rowid],
                        function (error) {
                            if (error) {
                                return console.log(error.message);
                            }
                            console.log(`Updated a row with the id: ${item.rowid}`);
                        }
                    );
                }
            });
        });
    });
}

module.exports = {
    connectToDatabase: connectToDatabase,
    closeDatabase: closeDatabase,
    createJobTable: createJobTable,
    insertOrUpdateJobTable: insertOrUpdateJobTable,
    createTopCVTable: createTopCVTable,
    insertOrUpdateTopCVTable: insertOrUpdateTopCVTable,
};
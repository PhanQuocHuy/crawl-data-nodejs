const express = require("express");
const path = require('path');
const router = express.Router();
const bodyParser = require("body-parser");
const app = express();

// Import your node file
const puppeteer = require("./puppeteer.js");

app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
});

// server css as static
app.use(express.static(__dirname));

// get our app to use body parser 
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/express/index.html");
});

app.post("/", (req, res) => {
    const keyword = req.body.keyword;
    puppeteer.startPage = 0;
    puppeteer.crawlData(keyword);
    res.send("Please wait a moment while crawling data for " + keyword);
});
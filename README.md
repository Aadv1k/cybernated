# cybernated 🤖

A news-aggregator email subscription service built from scratch

## Install

```shell
npm install
npm start
```
this will start a server and a cron job in the background.

## Stack

### backend / server

The app uses a watered down version of the [MVC](https://www.tutorialspoint.com/mvc_framework/mvc_framework_introduction.htm) framework. Here is a walkthrough of the project alongside the basic functionality

- We use `mongodb` and [atlas](https://www.mongodb.com/atlas) as our database; [`./models`](./models)
  - [`./models/NewsModel.js`](./models/NewsModel.js) the atlas cluster has a `newsdb` DB with `coinPrices`, `news` as two collections
  - [`./models/UserModel.js`](./models/UserModel.js) the atlas cluster has a `users` DB with a `users` collection to store user email
- We use builtin `http` module to handle server or any other requests [`./app/server.js`](./app/server.js)
- We use `Atlas API` to verify emails, the key is stored in `.env`; [`./app/EmailValidator.js`](./app/EmailValidator.js)
- `nodemailer` is used to send mails via an outlook account; [`./app/Mailer.js`](./app/Mailer.js)
- We use `cheerio` to scrape data from different sites; [`./app/NewsAggregator.js`](./app/NewsAggregator.js)
- We run a `node-cron` job that updates our news database, and sends a mail to all subscribers at 7:00 IST; [`./app/BulkMailer.js`](./app/BulkMailer.js)

All the "config" is located at [`./app/Constants.js`](./app/Constants.js)

### frontend

The app uses vanilla JavaScript and a simple [Notifier API](./public/notifier.js)

## API

### `/register`
- `?email=`: a real valid email address
  - the email is first validated through a syntax check 
  - in `production` the email is passed through [abstract API](https://www.abstractapi.com/) to ensure the address is real

### Response

example response:
```JSON
{
  "code": "email-invalid",
  "message": "the email provided is not valid",
  "status": 400
}
```

- 200 `email-registered`: the email was registered successfully
- 400 `fake-email`: the email provided is not a real address
- 400 `email-invalid`: the email is syntactically invalid 
- 400 `email-already-registered`: the email already exists in the database
- 500 `internal-err`: in this context, it may mean that email validation via [abstract API](https://www.abstractapi.com/) failed

## log

- [x] Basic email validation
  - Implemented email regex syntax check
  - Connect with [abstract API](https://www.abstractapi.com/) to ensure we don't get fake emails
  - make it so that API is only called in `production` mode, this is to preserve API calls
- [x] Implement a local "DB" and a wrapper module
  - implemented `./models/UserModel.js` which allows us to plug and play with database systems
  - currently we use `data.json` as a mock DB
- [x] A system to organize html; handle 404; CSS and JS handling
  - setup server JS and CSS responses; implement a decent landing page
  - ~~[TODO] Fix the javascript for the page; handle errors/success properly~~
    - Implemented a simple front-end [notifer API](./public/notifer.js) to handle status codes
  - ~~[TODO] Setup the 404 page with the same theme~~
- [x] Implement mongoDB service to store emails and data
- [x] Find out sites with good crypto news and crypto pricings, prediction etc; SCRAPE them  
  - Added Coindesk, theDefiant as sources for news; Add currency rates;
  - ~~[TODO] Figure out a way to systematically add these to our database~~
- [x] Send newsletters every morning with the updated DB of news
  - Setup a email template [./views/mailTemplate.ejs](./views/mailTemplate.ejs)
  - Setup a cron scheduler
  - implement a welcome page 

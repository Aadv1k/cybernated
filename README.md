# cybernated 🤖

https://user-images.githubusercontent.com/81357878/219027540-0c1dee05-c63c-4490-8e02-3b4cc7c8281f.mp4

## Install





```shell
npm install
npm start
```
this will start a server and a cron job in the background.

## Stack

### The backend

The app uses a watered down version of the [MVC](https://www.tutorialspoint.com/mvc_framework/mvc_framework_introduction.htm) framework. Here is a walkthrough of the project alongside the basic functionality

- For the server and other http operations we use the default `node-http` lib [`./app/server.js`](./app/server.js)
- The App uses regex and [Abstract API](https://www.abstractapi.com/) to verify the email [`./app/EmailValidator.js`](./app/EmailValidator.js)
  - `isEmailReal()`: checks with the API to see if email address is deliverable to
  - `isEmailValid()`: checks the syntax of the email
- We use MongoDB along with mongo node client ([Atlas](https://www.mongodb.com/atlas)) as our primary database for storing user emails and news data
  - [`./models/NewsModel.js`](./models/NewsModel.js) `Newsdb` contains `coinPrices`, `news` as two collections.
  - [`./models/UserModel.js`](./models/UserModel.js) `users` contains with a `users` collection to store user emails.
- To send the emails the App uses [Sendinblue](https://www.sendinblue.com/) [`./app/Mailer.js`](./app/Mailer.js)
  - `sendMail()`: add the user to contact list and send a new mail
- For the news the App uses `cheerio` and `node-http` to fetch and scrap the required data. [`./app/NewsAggregator.js`](./app/NewsAggregator.js)
  - `getNewsData()`: scrap the news from different sites and return a singular array
  - `getCoinPrices()`: scrap the coin prices and return an array
- Finally [`./app/BulkMailer.js`](./app/BulkMailer.js) runs a cron job that everyday at `7 AM IST`
  - `pushDataToDb()`: Clears the old data from `Newsdb` fetches new data `getCoinPrices()`, `getNewsData()` and puts it in their respective collections.
  - `mailAndPush()`: gets the list of all the users and uses `sendMail()` to send an email using the mail template to each user 
- [`./app/Constants.js`](./app/Constants.js)

### frontend

The app uses vanilla JavaScript and a simple [Notifier API](./public/notifier.js)

## API

### `/register?`
- `email=`: a real valid email address
  - the email is first validated through a syntax check 
  - in `production` the email is passed through [abstract API](https://www.abstractapi.com/) to ensure the address is real

### `/deregister?`
- `email=`: a real valid email address
  - will remove the email from the database if it exists will raise a `invalid-user-to-deregister`

### Responses

example response:
```JSON
{
  "code": "email-invalid",
  "message": "the email provided is not valid",
  "status": 400
}
```

- 200 `email-registered`: the email was registered successfully
- 200 `email-deregistered`: the email was deregistered successfully
- 400 `fake-email`: the email provided is not a real address
- 400 `email-invalid`: the email is syntactically invalid 
- 400 `email-exists`: the email already exists in the database
- 400 `invalid-user-to-deregister`: attempt to deregister a non-existent user
- 500 `internal-err`: in this context, it may mean that email validation via [abstract API](https://www.abstractapi.com/) failed
invalid-user-to-deregister

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
- [x] Change the implementation of index to accommodate images and post content within the site
- [x] CONCLUDE THE PROJECT
  - optimised the database documents to have less fields
  - implement caching in of the index


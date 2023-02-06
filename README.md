# cybernated

A customizable crypto-centric newsletter

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
  "message": "the email provided is not valid"
}
```

- 200 `email-registered`: the email was registered successfully
- 400 `email-invalid`: the email is either syntactically invalid OR is not real.
- 400 `email-already-registered`: the email already exists in the database
- 500 `internal-err`: in this context, it may mean that email validation via [abstract API](https://www.abstractapi.com/) failed

## log
- [x] ~~Basic email validation~~
  - Implemented email regex syntax check
  - Connect with [abstract API](https://www.abstractapi.com/) to ensure we don't get fake emails
  - make it so that API is only called in `production` mode, this is to preserve API calls
- [x] ~~Implement a local "DB" and a wrapper module~~ 
  - implemented `./models/UserModel.js` which allows us to plug and play with database systems
  - currently we use `data.json` as a mock DB
- [x] ~~A system to organize html; handle 404; CSS and JS handling~~
  - setup server JS and CSS responses; implement a decent landing page
  - ~~[TODO] Fix the javascript for the page; handle errors/success properly~~
    - Implemented a simple front-end [notifer API](./public/notifer.js) to handle status codes
  - ~~[TODO] Setup the 404 page with the same theme~~
- [x] Implement mongoDB service to store emails and data
- [x] Find out sites with good crypto news and crypto pricings, prediction etc; SCRAPE them  
  - Added Coindesk, theDefiant as sources for news; Add currency rates;
  - ~~[TODO] Figure out a way to systematically add these to our database~~
- [ ] Send newsletters every morning with the updated DB of news

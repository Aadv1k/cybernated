# cybernated

A customizable crypto-centric newsletter

## Dev
- [x] ~~Email validation~~
  - Implemented email regex syntax check
  - Connect with [abstract AP](https://www.abstractapi.com/) to ensure we don't get fake emails
  - make it so that API is only called in `production` mode, this is to preserve API calls
- [x] ~~Implement a local "DB" and a wrapper module~~ 
  - implemented `./models/UserModel.js` which allows us to plug and play with database systems
  - currently we use `data.json` as a mock DB
- [ ] A system to organize html; handle 404; CSS and JS handling
  - implement a fancy landing page, including cool CSS 
  - implement server JS and CSS responses
  - [ ] Fix the javascript for the page; handle errors/success properly
  - [ ] Setup the 404 page with the same theme
- [ ] Find out sites with good crypto news and crypto pricings, prediction etc; SCRAPE them  
- [ ] Send newsletters every morning with the updated DB of news

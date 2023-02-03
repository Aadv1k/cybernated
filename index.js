const { PORT } = require("./app/constants");
const server = require("./app/server");

server.listen(PORT);
console.log(`Server listening at http://localhost:${PORT}`);

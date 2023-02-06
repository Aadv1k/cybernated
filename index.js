const { PORT } = require("./app/Constants");
const server = require("./app/server");

server.listen(PORT);
console.log(`Server listening at http://localhost:${PORT}`);

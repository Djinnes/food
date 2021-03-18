const pgPromise = require("pg-promise");
const dotenv = require("dotenv");

const initOptions = {};

const pgp = pgPromise(initOptions);

// monitor.attach(initOptions);
// monitor.setTheme('matrix');

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

const cn = {
  host: DB_HOST,
  port: 5432,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  poolSize: 20,
  min: 0,
};
const db = pgp(cn);

db.connect()
  .then((obj) => {
    console.log(obj.client.serverVersion);
    obj.done();
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

module.exports = {
  db,
  pgp,
};

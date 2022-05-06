const pgPromise = require("pg-promise");
const dotenv = require("dotenv");
const path = require("path");
const { ConnectionString } = require("connection-string");

const initOptions = {};

const pgp = pgPromise(initOptions);

// monitor.attach(initOptions);
// monitor.setTheme('matrix');

dotenv.config();

const { DB_CONNECTION_STRING } = process.env;

const cs = new ConnectionString(DB_CONNECTION_STRING);

const sslrootcert = path.join(__dirname, "ca-certificate.crt");

cs.setDefaults({
  params: { sslrootcert },
});

const db = pgp(cs.toString());

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

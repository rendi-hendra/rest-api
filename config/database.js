const mysql = require("mysql");
// buat konfigurasi koneksi
const koneksi = mysql.createConnection({
  host: "localhost",
  user: "root",
  passport: "",
  database: "test",
  multipleStatements: true,
});
// koneksi database
koneksi.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected...");
});
module.exports = koneksi;

const express = require("express");
const bodyParser = require("body-parser");
const koneksi = require("./config/database");
const app = express();
const PORT = process.env.PORT || 8000;
const axios = require("axios").default;
const validator = require("validator");
const moment = require("moment");
moment.locale("id");
app.set("view engine", "ejs");

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// create data / insert data
app.post("/api/post", (req, res) => {
  // buat variabel penampung data dan query sql
  const data = { ...req.body };
  const querySql = "INSERT INTO posts SET ?";

  // Validasi
  if (data.post_at == undefined) {
    data.post_at = moment().format("LLLL");
  }

  if (data.nama == undefined) {
    console.log(data.post_at);
    return res
      .status(400)
      .json({ success: false, message: "Pastikan Nama Tidak Kosong!" });
  }
  if (data.judul == undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Pastikan Judul Tidak Kosong!" });
  }
  if (data.isi == undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Pastikan Isi Tidak Kosong!" });
  }

  // jalankan query
  koneksi.query(querySql, data, (err, rows, field) => {
    // error handling
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Gagal insert data!", error: err });
    }

    // jika request berhasil
    // res.status(201).json({
    //   success: true,
    //   message: "Data Berasil Di Masukkan",
    //   data: req.body,
    // });
    res.redirect("/");
  });
});

// read data / get data
app.get("/api/post", (req, res) => {
  // buat query sql
  const querySql = "SELECT * FROM posts";

  // jalankan query
  koneksi.query(querySql, (err, rows, field) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    // jika request berhasil
    res.status(200).json({ success: true, data: rows });
  });
});

// update data
app.put("/api/post/:id", (req, res) => {
  // buat variabel penampung data dan query sql
  const data = { ...req.body };
  const querySearch = "SELECT * FROM test.posts WHERE id = ?";
  const queryUpdate = "UPDATE test.posts SET ? WHERE id = ?";

  // jalankan query untuk melakukan pencarian data
  koneksi.query(querySearch, req.params.id, (err, rows, field) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    // jika id yang dimasukkan sesuai dengan data yang ada di db
    if (rows.length) {
      // jalankan query update
      koneksi.query(queryUpdate, [data, req.params.id], (err, rows, field) => {
        // error handling
        if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
        }

        // jika update berhasil
        res
          .status(200)
          .json({ success: true, message: "Berhasil update data!" });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan!", success: false });
    }
  });
});

// delete data
app.get("/api/post/delete/:id", (req, res) => {
  // buat query sql untuk mencari data dan hapus
  const querySearch = "SELECT * FROM test.posts WHERE id = ?";
  const queryDelete = "DELETE FROM test.posts WHERE id = ?";

  // jalankan query untuk melakukan pencarian data
  koneksi.query(querySearch, req.params.id, (err, rows, field) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    // jika id yang dimasukkan sesuai dengan data yang ada di db
    if (rows.length) {
      // jalankan query delete
      koneksi.query(queryDelete, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
        }

        // jika delete berhasil
        res.redirect("/");
      });
    } else {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan!", success: false });
    }
  });
});

// Coba

app.get("/api/post/:id", (req, res) => {
  const querySearch = "SELECT * FROM posts WHERE id = ?";

  koneksi.query(querySearch, req.params.id, (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    if (rows == "") {
      res.status(404).json({ success: false, data: null });
    }

    if (rows != "") {
      res.status(200).json({ success: true, data: rows });
    }
  });
});

// Query Parameter

app.get("/api/search/post", (req, res) => {
  const querySearch = "SELECT * FROM `posts` WHERE `judul` LIKE ?";

  koneksi.query(querySearch, req.query.q, (err, rows, field) => {
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    if (rows == "") {
      res.status(404).json({ success: false, data: null });
    }

    if (rows != "") {
      res.status(200).json({ success: true, data: rows });
    }
  });
});

// Coba

app.get("/", (req, res) => {
  axios.get("http://localhost:8000/api/post/").then(function (response) {
    res.render("index", {
      title: "Home",
      db: response.data.data,
    });
  });
  axios.get("http://localhost:8000/api/post/").then(function (respon) {
    // handle success
    let data = respon.data.data;
    data.forEach((d) => {
      let slug = d.judul.toLowerCase().replace(/\s+/g, "");
      app.get("/post/" + slug, (req, res) => {
        res.render("detail", {
          title: d.judul,
          db: d,
        });
      });
    });
  });
});

app.get("/posting", (req, res) => {
  res.render("posts", {
    title: "Post",
  });
});

axios.get("http://localhost:8000/api/post/").then(function (respon) {
  // handle success
  let data = respon.data.data;
  data.forEach((d) => {
    let slug = d.judul.toLowerCase().replace(/\s+/g, "");
    app.get("/post/" + slug, (req, res) => {
      res.render("detail", {
        title: d.judul,
        db: d,
      });
    });
  });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));

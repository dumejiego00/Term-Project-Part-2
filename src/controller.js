const fs = require("fs");
const { readFile } = require("fs/promises");
const path = require("path");
var qs = require("querystring");
var formidable = require("formidable");
const querystring = require("querystring");
const ejs = require("ejs");

const controller = {
  getHomePage: async (request, response) => {
    const data = await readFile("./database/data.json");
    const users = JSON.parse(data);
    fs.readFile("src/home.ejs", "utf8", (err, template) => {
      if (err) {
        console.error("Error reading template:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      const renderedHtml = ejs.render(template, { users });
      response.end(renderedHtml);
    });
  },
  getFormPage: (request, response) => {
    return response.end(`
    <h1>Hello world</h1> <style> h1 {color:red;}</style>
    <form action="/form" method="post">
    <input type="text" name="username"><br>
    <input type="text" name="password"><br>
    <input type="submit" value="Upload">
    </form>
    `);
  },
  sendFormData: (request, response) => {
    var body = "";

    request.on("data", function (data) {
      body += data;
    });

    request.on("end", function () {
      var post = qs.parse(body);
      console.log(post);
    });
  },

  getFeed: (request, response) => {
    let query = request.url.split("?");
    let qString = query[1];
    const user = querystring.decode(qString);
    const data = fs.readFileSync("./database/data.json");
    const userList = JSON.parse(data);
    const userInfo = userList.filter(
      (obj) => obj.username === user.username
    )[0];
    fs.readFile("src/feed.ejs", "utf8", (err, template) => {
      if (err) {
        console.error("Error reading template:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      const renderedHtml = ejs.render(template, { userInfo });
      response.end(renderedHtml);
    });
  },
  sendImages: (request, response) => {
    fs.createReadStream("." + request.url).pipe(response);
  },
  uploadImages: (request, response) => {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      if (err) {
        console.log(err.msg);
      } else {
        let query = request.url.split("?");
        let qString = query[1];
        const parameter = querystring.decode(qString);
        const file = files.myFile[0];
        const originalPath = file.filepath;
        const newPath = path.join(
          __dirname,
          "photos",
          parameter.username,
          file.originalFilename
        );
        fs.rename(originalPath, newPath, (err) => {
          if (err) {
            console.log(err.msg);
          }
        });
        fs.readFile("database/data.json", (err, data) => {
          if (err) {
            console.log(err.msg);
          } else {
            let users = JSON.parse(data);
            for (let user of users) {
              if (user.username === parameter.username) {
                user.photos.push(file.originalFilename);
              }
            }
            fs.writeFile("database/data.json", JSON.stringify(users), (err) => {
              if (err) {
                console.log(err.msg);
              } else {
                response.writeHead(302, {
                  Location: "/",
                });
                response.end();
              }
            });
          }
        });
      }
    });
  },
};

module.exports = controller;

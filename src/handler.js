const { parse } = require("url");
const { DEFAULT_HEADER } = require("./util/util.js");
const controller = require("./controller");
const { createReadStream } = require("fs");
const path = require("path");
const querystring = require("querystring");

const allRoutes = {
  // GET: localhost:3000/
  "/:get": (request, response) => {
    controller.getHomePage(request, response);
  },
  // POST: localhost:3000/form
  "/form:post": (request, response) => {
    controller.sendFormData(request, response);
  },
  // POST: localhost:3000/images
  "/images:post": (request, response) => {
    controller.uploadImages(request, response);
  },
  // GET: localhost:3000/feed
  // Shows instagram profile for a given user
  "/feed:get": (request, response) => {
    controller.getFeed(request, response);
  },
  sendImg: (request, response) => {
    controller.sendImages(request, response);
  },
  default: (request, response) => {
    response.writeHead(404, DEFAULT_HEADER);
    createReadStream(path.join(__dirname, "views", "404.html"), "utf8").pipe(
      response
    );
  },
};

function imgChecker(requestPath) {
  const splitPath = requestPath.split(".");
  const format = ["apng", "avif", "gif", "jpg", "jpeg", "png", "svg", "webp"];
  if (format.includes(splitPath[splitPath.length - 1])) {
    return true;
  }
  return false;
}

function handler(request, response) {
  const { url, method } = request;
  const { pathname } = parse(url, true);

  if (imgChecker(pathname)) {
    return Promise.resolve(allRoutes.sendImg(request, response)).catch(
      handlerError(response)
    );
  }

  const key = `${pathname}:${method.toLowerCase()}`;
  const chosen = allRoutes[key] || allRoutes.default;

  return Promise.resolve(chosen(request, response)).catch(
    handlerError(response)
  );
}

function handlerError(response) {
  return (error) => {
    console.log("Something bad has  happened**", error.stack);
    response.writeHead(500, DEFAULT_HEADER);
    response.write(
      JSON.stringify({
        error: "internet server error!!",
      })
    );

    return response.end();
  };
}

module.exports = handler;

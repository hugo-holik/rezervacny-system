require("dotenv").config();
require("express-async-errors");
const express = require("express");
const i18next = require("i18next");
const middleware = require("i18next-http-middleware");
const { json } = require("body-parser");
const authMiddleware = require("./src/middlewares/auth");
const { throwError } = require("./src/util/universal");
const { errorHandler } = require("./src/middlewares/error-handler");

const app = express();

// LOCALIZATION START
i18next.init({
  lng: "sk",
  fallbackLng: "sk",
  resources: {
    sk: {
      translation: require("./src/locales/sk").sk,
    },
  },
});
app.use(middleware.handle(i18next));
// LOCALIZATION END

app.use(express.json({ limit: "50mb" }));

app.use(json());
app.use(authMiddleware);

app.use("/public", require("./src/routes/public"));
app.use("/user", require("./src/routes/user"));
app.use("/admin", require("./src/routes/admin"));

app.use(function (req, res, next) {
  throwError("Hľadaná stránka neexistuje", 404);
});

app.use(errorHandler);

module.exports = app;

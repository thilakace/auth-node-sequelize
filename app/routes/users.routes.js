module.exports = app => {
  const users = require("../controllers/users.controller.js");
  const rateLimiter = require('../middleware/rateLimiter');

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/",rateLimiter, users.create);
  router.get("/:id", users.findOne);


  router.get("/activate/:id", users.userActivate);
  router.post("/doLogin", users.doLogin);
  router.get("/acceptLogin/:key/:id", users.acceptLogin);
  router.get("/getTimeApi/:token", users.getTimeApi);
  router.get("/kickoutApi/:user", users.kickoutApi);


  app.use('/api/users', router);
};
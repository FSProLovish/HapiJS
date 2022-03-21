const Sequelize = require("sequelize");

const sequelize = new Sequelize("hapi_tutorial", "root", "PItutary6@", {
  host: "127.0.0.1",
  port: 3306,
  dialect: "mysql",
});

module.exports.connect = sequelize;

const Connection = require("../dbconfig");
const { DataTypes } = require("sequelize");

const dbConnection = Connection.connect;

const Users = dbConnection.define(
  "users",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports.createUser = function (username, password) {
  Users.create({ username, password }).then((data) => {
    console.log(data.toJSON());
  });
};

module.exports.updateUser = function (username, password) {
  Users.update(
    {
      username,
    },
    {
      where: {
        password,
      },
    }
  ).then((data) => {
    console.log(data);
  });
};

module.exports.destroyUser = function (username, password) {
  Users.destroy({
    where: {
      username,
    },
  }).then((data) => {
    console.log(data);
  });
};

// dbConnection.drop().then(()=>{
//     dbConnection.sync();
// })

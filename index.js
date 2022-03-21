const Path = require("path");
const Hapi = require("@hapi/hapi");
const Vision = require("@hapi/vision");
const Cookie = require("@hapi/cookie");
const path = require("path");
const Connection = require("./dbconfig");
const Users = require("./models/users");
const Boom = require("@hapi/boom");

const users = {
  WittCode: {
    username: "WittCode",
    password: "soccer",
    id: 0,
    name: "Witt Code",
  },
  Greg: {
    username: "Greg",
    password: "1234",
    id: 1,
    name: "Gregory",
  },
};

// const validate = async (request, username, password, h) => {
//   if (!users[username]) {
//     return {
//       isValid: false,
//     };
//   }

//   const user = users[username];

//   if (user.password === password) {
//     return {
//       isValid: true,
//       credentials: {
//         id: user.id,
//         name: user.name,
//       },
//     };
//   } else {
//     return {
//       isValid: false,
//     };
//   }
// };

const init = async () => {
  const server = Hapi.Server({
    port: 8000,
    host: "localhost",
    routes: {
      files: {
        relativeTo: Path.join(__dirname, "static"),
      },
    },
  });

  await server.register(Vision);
  await server.register(Cookie);

  server.auth.strategy("login", "cookie", {
    cookie: {
      name: "session",
      password: "soccersoccersoccersoccersoccersoccer",
      isSecure: false,
      ttl: 100000,
    },
    redirectTo: "/login",
    validateFunc: async (request, session) => {
      if ((session.name === "WittCode", session.password === "subscribe")) {
        return { valid: true };
      } else {
        return { valid: false };
      }
    },
  });

  server.auth.default("login");

  server.views({
    engines: {
      hbs: require("handlebars"),
    },
    path: path.join(__dirname, "views"),
    layout: "default",
  });

  await server.register(require("@hapi/inert"));
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      if (request.auth.isAuthenticated) {
        return h.redirect("/welcome");
      }
      return h.file("welcome.html");
    },
    options: {
      auth: {
        mode: "try",
      },
    },
  });

  server.route({
    method: "GET",
    path: "/users",
    handler: (request, h) => {
      return "<h1>USERS</h1>";
    },
  });

  // server.route({
  //   method: "GET",
  //   path: "/loginBasic",
  //   handler: (request, h) => {
  //     const name = request.auth.credentials.name;
  //     return `Welcome ${name} to my restricted page`;
  //   },
  //   options: {
  //     auth: "login",
  //   },
  // });
  // server.route({
  //   method: "GET",
  //   path: "/logoutBasic",
  //   handler: (request, h) => {
  //     return Boom.unauthorized("You have been logged out successfully");
  //   },
  // });

  server.route({
    method: "GET",
    path: "/logout",
    handler: (request, h) => {
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  });

  server.route({
    method: "POST",
    path: "/login",
    handler: (request, h) => {
      if (
        request.payload.name === "WittCode" &&
        request.payload.password === "subscribe"
      ) {
        request.cookieAuth.set({
          name: request.payload.name,
          password: request.payload.password,
        });
        return h.redirect("/welcome");
      } else {
        return h.redirect("/");
      }
    },
    options: {
      auth: {
        mode: "try",
      },
    },
  });

  server.route({
    method: "GET",
    path: "/welcome",
    handler: (request, h) => {
      return `Hello ${request.auth.credentials.name}`;
    },
  });

  server.route({
    method: "GET",
    path: "/getUsers",
    handler: async (request, h) => {
      const dbConnection = await Connection.connect;
      await dbConnection.authenticate();
      const [users, metData] = await dbConnection.query("SELECT * FROM users");
      return h.view("users", {
        users,
      });
    },
  });

  server.route({
    method: "GET",
    path: "/update-user",
    handler: (request, h) => {
      return h.file("userUpdate.html");
    },
  });

  server.route({
    method: "GET",
    path: "/delete-user",
    handler: (request, h) => {
      return h.file("userDelete.html");
    },
  });

  server.route({
    method: "POST",
    path: "/delete",
    handler: async (request, h) => {
      const user = await Users.destroyUser(
        request.payload.name,
        request.payload.password
      );
      return {
        message: "SUCCESSFUL DELETED",
      };
    },
  });

  server.route({
    method: "POST",
    path: "/update",
    handler: async (request, h) => {
      const user = await Users.updateUser(
        request.payload.name,
        request.payload.password
      );
      return {
        message: "SUCCESSFUL UPDATED",
      };
    },
  });

  await server.start();
  console.log("Server is running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();

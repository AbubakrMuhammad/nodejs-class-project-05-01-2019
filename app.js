/************
 NodeJS
************/

/****************
 CUSTOM FUNCTIONS
*****************/

// Random Id Generation
const randomId = () => {
  let id = "";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  for (let i = 0; i < 16; i++) {
    id +=
      uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  }
  return id;
};

// Getting Users
const getUsers = () => {
  fs.readFile("./files/users.json", (err, data) => {
    if (!err) {
      users = JSON.parse(fs.readFileSync("./files/users.json", "utf-8"));
    }
  });
};

// Updating User
const setDp = updatedUser => {
  fs.readFile("./files/users.json", (err, data) => {
    let users = JSON.parse(data);
    users.forEach(user => {
      if (
        (user.username == updatedUser.username &&
          user.password == updatedUser.password) ||
        user.id == updatedUser.id
      ) {
        user.dp = updatedUser.dp;
      }
    });
    fs.writeFile("./files/users.json", JSON.stringify(users), err => {
      console.log("User Updated");
    });
  });
};

// Setting Users
const setUsers = user => {
  fs.readFile("./files/users.json", (err, data) => {
    let users = JSON.parse(data);
    users.push(user);
    fs.writeFile("./files/users.json", JSON.stringify(users), err => {
      console.log("User Updated");
    });
    getUsers();
  });
};

/*********
 IMPORTS
**********/

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const localStrategy = require("passport-local").Strategy;

/*************
 MIDDLEWARES
*************/

// New Server
const server = express();

// Static Files
server.use(express.static("./static"));

// Body Parser
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// PassportJS
server.use(session({ secret: "secret-word" }));
server.use(passport.initialize());
server.use(passport.session());

/***********
 GET PATHS
************/

// For Home
server.get("/", (req, res) => {
  res.sendFile(path.join(`${__dirname}\\static\\index.html`));
});

server.get("/home", (req, res) => {
  res.sendFile(path.join(`${__dirname}\\static\\index.html`));
});

// For user authentication
server.get(
  "/E1uE3dN9cS5lP7lG2jH3yW1pI7qL8jA8hC0uE2gV3zD6qT2o",
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      res.send({ error: true });
    } else {
      res.send(req.user);
    }
  }
);

// To Handle Errors
server.get("/404", (req, res) => {
  res.sendFile(`${__dirname}\\static\\errors\\404.html`);
});

server.get("/401", (req, res) => {
  res.sendFile(`${__dirname}\\static\\errors\\401.html`);
});

// For logging out
server.get("/logout", (req, res, next) => {
  let user = req.user;
  if (user.fb) {
    fs.readFile("./files/users.json", (err, data) => {
      let users = JSON.parse(data);
      users.forEach((data, index) => {
        if (data.id == user.id) {
          users.splice(index, 1);
        }
      });
      fs.writeFile("./files/users.json", JSON.stringify(users), err => {
        console.log("User Updated");
      });
      getUsers();
    });
  }

  req.logout();
  res.redirect("/");
});

// Getting users from the file
let users = [];
getUsers();

/************
 PassportJs
************/

// Local Strategy
passport.use(
  new localStrategy((username, password, next) => {
    let user = users.find(user => {
      return user.username === username && user.password === password;
    });

    if (user) {
      next(null, user);
    } else {
      next(null, false);
    }
  })
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: "765963367097799",
      clientSecret: "5750c38cdca3f8ad20c011ca3ac371a8",
      callbackURL: "/facebook/callback",
      profileFields: ["id", "displayName", "picture.type(large)"]
    },

    (accessToken, refreshToken, profile, next) => {
      let user = users.find(user => {
        return user.id === profile.id;
      });
      if (user) {
        next(null, user);
      } else {
        user = {
          id: profile.id,
          username: profile.displayName,
          dp: profile.photos[0].value,
          fb: true
        };
        setUsers(user);
        next(null, user);
      }
    }
  )
);

// Serializing
passport.serializeUser((user, next) => {
  next(null, user.id);
});

// Deserailizing
passport.deserializeUser((id, next) => {
  let user = users.find(user => {
    return user.id === id;
  });
  next(null, user);
});

/*****************
 Create a new user
*****************/

server.post("/create", (req, res) => {
  fs.readFile("./files/users.json", (err, data) => {
    if (err) {
      req.body.id = randomId();
      req.body.dp = "static\\images\\person.svg";
      req.body.fb = false;
      users.push(req.body);
      fs.appendFile("./files/users.json", JSON.stringify(users), err => {
        if (err) throw err;
      });
    } else {
      req.body.id = randomId();
      req.body.dp = "static\\images\\person.svg";
      users.push(req.body);
      req.body.fb = false;
      fs.writeFile("./files/users.json", JSON.stringify(users), err => {
        if (err) throw err;
      });
    }
    req.logIn(req.body, () => {
      res.redirect("/profile.html");
    });
  });
});

/**************
 Login a user
***************/

// Local Login
server.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile.html",
    failureRedirect: "/"
  })
);

// Facebook Login
server.get("/facebook", passport.authenticate("facebook"));
server.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res, next) => {
    res.redirect("/profile.html");
  }
);

/*************************
 Handling Picture Upload
*************************/

const customConfig = multer.diskStorage({
  destination: (req, res, next) => {
    next(null, "./static/images/profile-pics");
  },
  filename: (req, file, next) => {
    next(null, `${req.user.username}-${file.originalname}`);
  }
});

const upload = multer({ storage: customConfig });

server.post("/upload", upload.single("dp"), (req, res) => {
  req.user.dp = req.file.path;
  setDp(req.user);
  res.redirect("/profile.html");
});

// 404 Eror Handler
server.get("*", (req, res, next) => {
  res.redirect("/404");
});

// Server listen
server.listen(8080, _ => {
  console.log("Server has been successfully started.");
});

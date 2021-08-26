const express = require("express")
var session = require("express-session")
var mysql = require('mysql');
const path = require("path");
const dotenv = require("dotenv");
var hbs = require("hbs");
var fileUpload = require('express-fileupload');
const { urlencoded } = require('express');
const { request } = require("http");
const { time } = require("console");


// genral application setting  

var app = express()
const PORT = process.env.PORT || 3000;
const static_path = path.join(__dirname + "/static")
const template_path = path.join(__dirname + "/template/veiws")
const partials_path = path.join(__dirname + "/template/partials")

dotenv.config({
	path: './.env'
})
app.use(session({ secret: 'Mohd Kamleen', saveUninitialized: true, resave: true }));
app.use(urlencoded({ extended: false }))
app.use(express.static(static_path));
app.set("view engine", "hbs")
app.use(fileUpload());
app.set("views", template_path)
hbs.registerPartials(partials_path)



// database connection process 

var conn = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASSWORD
});
conn.connect(function (err) {
	if (err) throw err;
	console.log("backend connected")
});
// create database for authentication 
var sql = "create database if not exists cqout"
conn.query(sql, (err, res) => {
	console.log("(cqout) database created")
})
// use authentication database  
var sql = "use cqout"
conn.query(sql, (err, res) => {
	console.log("use (cqout) database")
})
// create table for auth 
var sql = "CREATE TABLE if not exists auth (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), username VARCHAR(255), password VARCHAR(255), last_login BIGINT(255), image VARCHAR(255))";
conn.query(sql, (err, res) => {
	console.log("(auth) table created")
})
// var sql = "drop database cqout";
// conn.query(sql, (err, res) => {
// 	console.log("(auth) table created")
// })  


// get and post urls     

app.get('/', function (request, response) {


	if (request.session.loggedin) {
		conn.query('SELECT * FROM `auth`', function (error, auth, fields) {
			conn.query('SELECT * FROM `auth` where username = ?', [request.session.user], function (error, currentUser, fields) {
				response.render("index", {
					title: "| Dashboard",
					auth: auth,
					currentUser: currentUser
				})
			})
		})

	} else {

		conn.query('SELECT * FROM `auth`', function (error, auth, fields) {
			if (auth.length > 0) {
				response.render("index", {
					title: "| Dashboard",
					auth: auth
				})
			} else {
				response.render("index", {
					title: "| Dashboard",
					message: "Not avilable Users"
				})
			}
		})
	}

})

app.get('/admin', function (req, res) {
	conn.query('SELECT * FROM `auth`', function (error, auth, fields) {
		res.render("admin", {
			title: "| Admin",
			auth: auth
		})
	})
})

app.get('/login', function (req, res) {

	res.render("login", {
		title: "| Login",
		message: ""
	})
})

app.get('/signup', function (req, res) {
	res.render("signup", {
		title: "| Signup",
		message: ""
	})
})


app.get('/userdelete/:id', function (req, res) {
	conn.query('DELETE FROM `auth` WHERE id = ?', [req.params.id], function (error, results, fields) {
		res.redirect("/admin")
	})
})

app.post('/login', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;

	if (username && password) {
		conn.query('SELECT * FROM `auth` WHERE username = ? and password = ?', [username, password], function (error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.user = request.body.username;
				response.redirect('/');
				console.log(results)
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/signup', function (request, response) {

	var name = request.body.name;
	var username = request.body.username;
	var password = request.body.password;

	if (name && username && password) {
		conn.query('SELECT * FROM `auth` WHERE username = ?', [username], function (error, results, fields) {
			if (results.length > 0) {
				response.send('UserName alredy exist');
			} else {
				conn.query("INSERT INTO `auth`(`name`, `username`, `password`, `last_login`,image) VALUES (?,?,?,?,?)", [name, username, password, new Date().getTime(), "image/user.jpg"], function (err, res) {
					if (err) throw err;
					console.log(name, 'is created');

					// not work this code 
					// response.redirect("/login")
				})
			}
			response.end();
		});
	} else {
		response.send('Please enter name, username and Password!');
		response.end();
	}

});




app.post('/updateProfile', function (request, response) {


	var file = request.files.profileImage;
	var id = request.body.id;
	var name = request.body.name;
	var username = request.body.username; 
	conn.query('UPDATE auth SET name=?,username=?,image=? WHERE id=?', [name, username, '/image/' + file.name, id], function (error, results, fields) {
		file.mv('static/image/' + file.name); 
		response.redirect("/")
	})

});






app.get('/logout', function (req, res) {
	req.session.loggedin = false;
	res.redirect("/")
})





app.post('/userupdate', function (request, response) {


	var id = request.body.id;
	var name = request.body.name;
	var username = request.body.username;
	var password = request.body.password;

	conn.query('UPDATE auth SET name=?,username=?,password=? WHERE id=?', [name, username, password, id], function (error, results, fields) {
		if (error) throw error;
		response.redirect("/admin")
	});
});


app.post('/forgot', function (req, res) {
	res.render("forgot", {
		title: "| Forgot",
		message: "This Proccess can not be added"
	})
})

app.get('/forgot', function (req, res) {
	res.render("forgot", {
		title: "| Forgot",
		message: "This Proccess can not be added"
	})
})




//  application run code here 

app.listen(PORT, function (req, res) {
	console.log(`connected  port ${PORT}`)
})






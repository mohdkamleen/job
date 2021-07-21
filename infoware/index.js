const express = require("express")
var session = require("express-session")
var mysql = require('mysql'); 
const path = require("path");
const dotenv = require("dotenv");
var hbs = require("hbs");
const { urlencoded } = require('express');
const { request } = require("http");

 
// genral application setting  

var app = express()
const PORT = process.env.PORT || 3000;
const static_path = path.join(__dirname + "/static")
const template_path = path.join(__dirname + "/template/veiws")
const partials_path = path.join(__dirname + "/template/partials")

dotenv.config({
	path: './.env'
})
app.use(session({secret: 'Mohd Kamleen',saveUninitialized: true,resave: true}));
app.use(urlencoded({ extended: false }))
app.use(express.static(static_path));
app.set("view engine", "hbs") 
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
var sql = "create database if not exists infoware"
conn.query(sql, (err, res) => {
	console.log("(infoware) database created")
})
// use authentication database  
var sql = "use infoware" 
conn.query(sql, (err, res) => {
	console.log("use (infoware) database")
})
// create table for auth 
var sql = "CREATE TABLE if not exists auth (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), username VARCHAR(255), password VARCHAR(255))";
conn.query(sql, (err, res) => {
	console.log("(auth) table created")
}) 


 
// get and post urls     

app.get('/', function (request, response) { 
	if (request.session.loggedin) {
		response.render("index", { 
			title: "| Dashboard",  
			user: request.session.username
		})
	} else {
		response.render("index", { 
			title: "| Dashboard",  
			user: request.session.username
		}) 
	}   
})

app.get('/login', function (req, res) {
	res.render("login", {
		title: "| Login",
		message: "Defult Message of LogIn"
	})
})

app.get('/signup', function (req, res) {
	res.render("signup", {
		title: "| Signup",
		message: "Defult Message of SignUp"
	})
})

app.get('/forgot', function (req, res) {
	res.render("forgot", {
		title: "| Forgot",
		message: "Defult Message of forgot"
	})
})

app.post('/login', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		conn.query('SELECT * FROM `auth` WHERE username = ? and password = ?', [username, password], function (error, results, fields) {
			if (results.length > 0) { 
				request.session.loggedin = true;  
				request.session.username = request.body.username;  
				response.redirect('/');
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
				conn.query("INSERT INTO `auth`(`name`, `username`, `password`) VALUES (?,?,?)", [name, username, password], function(err, res){
					if (err) throw err; 
					console.log('user created');     
					// response.render("index")
				}) 
			}
			response.end();
		});  
	} else { 
		response.send('Please enter name, username and Password!');
		response.end();
	}
 
});  


app.get('/logout', function (req, res) {
	req.session.loggedin=false;  
	res.redirect("/") 
})
 


 

//  application run code here 

app.listen(PORT, function (req, res) {
	console.log(`connected  port ${PORT}`)
})




 

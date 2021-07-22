const express = require("express")
var session = require("express-session")
var mysql = require('mysql');
const path = require("path");
const dotenv = require("dotenv");
var hbs = require("hbs");
var fileUpload = require('express-fileupload');
const { urlencoded } = require('express');
const { request } = require("http");
// const { request } = require("http");


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
// create table for items 
var sql = "CREATE TABLE if not exists items (id INT AUTO_INCREMENT PRIMARY KEY, image VARCHAR(255), description VARCHAR(255), rate VARCHAR(255), itemadd VARCHAR(255))";
conn.query(sql, (err, res) => {
	console.log("(items) table created")
})



// get and post urls     

app.get('/', function (request, response) {


	if (request.session.loggedin) {
		conn.query('SELECT * FROM `items`', function (error, results, fields) {
			response.render("index", {
				title: "| Dashboard",
				data: results,
				user: request.session.username
			})
		})

	} else {

		conn.query('SELECT * FROM `items`', function (error, results, fields) {
			if (results.length > 0) {
				response.render("index", {
					title: "| Dashboard",
					data: results
				})
			} else {
				response.render("index", {
					title: "| Dashboard",
					message: "Not avilable items"
				})
			}
		})
	}

})

app.get('/admin', function (req, res) {

	if (req.session.loggedin) {

		conn.query('SELECT * FROM `auth`', function (error, auth, fields) {
			conn.query('SELECT * FROM `items`', function (error, data, fields) {
				res.render("admin", {
					title: "| Admin",
					data: data,
					auth: auth,
					user: req.session.username
				})
			})
		})

	} else {
		res.redirect("/login")
	}
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

app.get('/forgot', function (req, res) {
	res.render("forgot", {
		title: "| Forgot",
		message: ""
	})
})

app.get('/itemdelete/:id', function (req, res) {
	conn.query('DELETE FROM `items` WHERE id = ?', [req.params.id], function (error, results, fields) {
		res.redirect("/admin")
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

		// if(username == "admin" && password == "1234"){ 
		// 	response.redirect("/admin"); 
		// 	request.session.admin = "admin" 
		// 	request.session.adminlog = true
		// 	response.end();
		// }

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
				conn.query("INSERT INTO `auth`(`name`, `username`, `password`) VALUES (?,?,?)", [name, username, password], function (err, res) {
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


app.get('/logout', function (req, res) {
	req.session.loggedin = false;
	req.session.adminlog = false;
	res.redirect("/")
})
 

app.get('/insert', function (req, res) {

	if (req.session.loggedin) {
		res.render("insert", {
			title: "| Insert",
			user: req.session.username
		})

	} else {
		res.redirect("/")
	}

})

app.get('/cart', function (req, res) {

	if (req.session.loggedin) {
		res.render("cart", {
			title: "| Cart",
			user: req.session.username
		})

	} else {
		res.redirect("/")
	}

})

app.post('/insert', function (request, response) {

	var file = request.files.uploaded_image;
	var description = request.body.description;
	var rate = request.body.rate;
	var itemadd = true;

	if (file && description && rate) {
		file.mv('static/image/' + file.name, function (err) {
			conn.query('INSERT INTO `items`(`image`, `description`, `rate`, `itemadd`) VALUES (?,?,?,?)', ['/image/' + file.name, description, rate, itemadd], function (err, red, fields) {
				if (err) throw err;
				response.redirect("/admin")
			})
		})


	} else {
		response.send('Please enter all feilds');
		response.end();
	}

});


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




//  application run code here 

app.listen(PORT, function (req, res) {
	console.log(`connected  port ${PORT}`)
})






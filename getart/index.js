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
var sql = "create database if not exists getart"
conn.query(sql, (err, res) => {
	console.log("(getart) database getart")
})
// use authentication database  
var sql = "use getart"
conn.query(sql, (err, res) => {
	console.log("use (getart) database")
})
// create table for auth 
var sql = "CREATE TABLE if not exists auth (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), username VARCHAR(255), password VARCHAR(255))";
conn.query(sql, (err, res) => {
	console.log("(auth) table created")
})
// create table for items  
var sql = "CREATE TABLE if not exists items (id INT AUTO_INCREMENT PRIMARY KEY, image VARCHAR(255), variantsImg1 VARCHAR(255), variantsImg2 VARCHAR(255), variantsImg3 VARCHAR(255), variantsTxt4 VARCHAR(255),variantsImg4 VARCHAR(255), variantsTxt1 VARCHAR(255),variantsTxt2 VARCHAR(255),variantsTxt3 VARCHAR(255), description VARCHAR(255), title VARCHAR(255), rate VARCHAR(255), stockStatus VARCHAR(255))";
conn.query(sql, (err, res) => {
	console.log("(items) table created")
})

// var sql = "DROP DATABASE getart";
// conn.query(sql, (err, res) => {
// 	console.log("(items) table created")
// })


// get and post urls     

app.get('/', function (request, response) {


	if (request.session.loggedin) {
 
		conn.query('SELECT * FROM `auth` where username = ?',[request.session.username], function (error, auth, fields) {
			conn.query('SELECT * FROM `items`', function (error, results, fields) {
				var userName = "";
				auth.forEach(element => {
					userName = element.name
				});
			response.render("index", {
				title: "| Dashboard", 
				data: results,
				user: request.session.username,
				userName: userName
			})
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
	if (req.session.loggedin) {
	conn.query('DELETE FROM '+ req.session.username +' WHERE id = ?', [req.params.id], function (error, results, fields) {
		conn.query('DELETE FROM `items` WHERE id = ?', [req.params.id]);
		res.redirect("/admin")
	})
} else {
	res.redirect("/login");
}
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
 
				var sql = "CREATE TABLE if not exists " + request.session.username + " (id INT AUTO_INCREMENT PRIMARY KEY, image VARCHAR(255), variant VARCHAR(255),inCard INT(50), description VARCHAR(255), title VARCHAR(255), quantity VARCHAR(255), rate VARCHAR(255))";
				conn.query(sql, (err, res) => {
					console.log(request.session.username + " table created")
				})

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
				conn.query("INSERT INTO `auth`(`name`, `username`, `password`) VALUES (?,?,?)", [name, username, password], function (err, results, res) {
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
		conn.query('SELECT * FROM ' + req.session.username + ' WHERE inCard = ?', [1], function (error, results, fields) {
			res.render("cart", {
				title: "| Dashboard",
				data: results,
				user: req.session.username
			})
		})

	} else {
		res.redirect("/")
	}

})

app.post('/insert', function (request, response) {


	if (request.session.loggedin) {
		var title = request.body.title;
		var description = request.body.description;
		var rate = request.body.rate;
		var file = request.files.product_image;
		var variants1Img = request.files.variants1Img;
		var variants2Img = request.files.variants2Img;
		var variants3Img = request.files.variants3Img;
		var variants4Img = request.files.variants4Img;
		var variantsTxt1 = request.body.variantsTxt1;
		var variantsTxt2 = request.body.variantsTxt2;
		var variantsTxt3 = request.body.variantsTxt3;
		var variantsTxt4 = request.body.variantsTxt4;
		var product_status = request.body.product_status; 


		
			
		if (variants1Img) {
			variants1Img.mv('static/product_image/' + variants1Img.name);
			variants1Img = "/product_image/"+variants1Img.name;
		}
		if (variants2Img) {
			variants2Img.mv('static/product_image/' + variants2Img.name);
			variants2Img = "/product_image/"+variants2Img.name;
		}
		if (variants3Img) {
			variants3Img.mv('static/product_image/' + variants3Img.name);
			variants3Img = "/product_image/"+variants3Img.name;
		}
		if (variants4Img) {
			variants4Img.mv('static/product_image/' + variants4Img.name);
			variants4Img = "/product_image/"+variants4Img.name;
		}
 


		conn.query('INSERT INTO `items` (`image`, `variantsImg1`, `variantsImg2`, `variantsImg3`, `variantsImg4`, `variantsTxt1`, `variantsTxt2`, `variantsTxt3`, `variantsTxt4`, `description`, `title`, `rate`, `stockStatus`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', ['/product_image/' + file.name, variants1Img, variants2Img, variants3Img, variants4Img, variantsTxt1, variantsTxt2, variantsTxt3, variantsTxt4, description, title, rate, product_status], function (err, red, fields) {
			if (err) throw err; 
			conn.query('INSERT INTO '+request.session.username+'(`image`, `inCard`, `description`, `title`, `rate`, `quantity`) VALUES (?,?,?,?,?,?)', ['/product_image/'+file.name, 0, description,title, rate, 1])
			file.mv('static/product_image/' + file.name); 
			response.redirect("/admin");
		}) 
	} else {
		response.redirect("/login");
	}
});



app.post('/profileupdate', function (request, response) {


	var id = request.body.id;
	var name = request.body.name;
	var username = request.body.username; 

	conn.query('UPDATE auth SET name=?,username=? WHERE id=?', [name, username, id], function (error, results, fields) {
		if (error) throw error;
		response.redirect("/profile")
	});
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

app.post('/updateIntoCart', function (request, response) {
	if (request.session.loggedin) {

		var id = request.body.id;
		var variant = request.body.variant;

		conn.query('UPDATE ' + request.session.username + ' SET variant=?,inCard = ? WHERE id=? ', [variant, 1, id], function (error, results, fields) {
			if (error) throw error;
			response.redirect("/")
		});
	} else {
		response.redirect("/login")
	}
});

app.post('/removeItemFromCart', function (request, response) {
	if (request.session.loggedin) {

		var id = request.body.id; 

		conn.query('UPDATE ' + request.session.username + ' SET inCard = ? WHERE id=? ', [0, id], function (error, results, fields) {
			if (error) throw error;
			response.redirect("/cart")
		});
	} else {
		response.redirect("/login")
	}
});


app.post('/forgot', function (req, res) {
	res.render("forgot", {
		title: "| Forgot",
		message: "This Proccess can not be added"
	})
})


app.get('/profile', function (request, response) {


	if (request.session.loggedin) {
 
		conn.query('SELECT * FROM `auth` where username = ?',[request.session.username], function (error, auth, fields) {
			conn.query('SELECT * FROM `items`', function (error, results, fields) {
				var profile = "";
				auth.forEach(element => {
					profile = element
				});
			response.render("profile", {
				title: "| Profile", 
				data: profile,
				user: request.session.username 
			})
		})
		})

	} else {
		response.redirect("/login");
	}
})


//  application run code here 

app.listen(PORT, function (req, res) {
	console.log(`connected  port ${PORT}`)
})






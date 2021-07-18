var express = require('express')
var app = express()

app.use(express.static(__dirname + '/static'));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(__dirname + "/index.html")
})

// app.get('/auth', function (req, res) {
//   res.sendFile(__dirname + "/auth.html")
// })

// app.get('/other', function (req, res) {
//   res.sendFile(__dirname + "/other.html")
// })

app.listen(3000, function(req, res){
    console.log("connected 3000 port")
})
var path = require('path');
var ghost = require('ghost');


// ghost({
//   config: path.join(__dirname, 'config.js')
// }).then(function (ghostServer) {
//   ghostServer.start();
// });

const express = require('express')
const port = process.env.PORT || 3000
const app = express()

// serve static assets normally

app.get('/.well-known/acme-challenge/A351gYuIHLauEC57o77ASWevIIJRxOs0Ld0TcB9hKJ8', function(req, res) {
  res.send('A351gYuIHLauEC57o77ASWevIIJRxOs0Ld0TcB9hKJ8.H1SlZeGtnplEaBDxGsrnnIIT4f9I2Izl4soaQSD4GXY')
})
app.get('/.well-known/acme-challenge/qVwXp_ET1avZok5tdPYgOjXhVicCDdBWprhgsJmJbFE', function(req, res) {
  res.send('qVwXp_ET1avZok5tdPYgOjXhVicCDdBWprhgsJmJbFE.H1SlZeGtnplEaBDxGsrnnIIT4f9I2Izl4soaQSD4GXY')
})
// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', function (request, response){
  response.send("hi");
})


app.listen(port)
console.log("server started on port " + port)

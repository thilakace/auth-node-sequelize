const express = require('express')
const app = express()
var bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const Sequelize = require("sequelize");





// form submit
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set('port', process.env.PORT || 3000)


app.listen(app.get('port'), () => {
  console.log(`My app listening on port ${app.get('port')}`)
})

const db = require("./app/models");
db.sequelize.sync();

require("./app/routes/users.routes")(app);

app.get('/', (req, res) => {
    res.send('Hello World from route')
})

app.get('/api/doLogin', (req, res) => {
    res.send('for login api')
})

module.exports = app // for testings

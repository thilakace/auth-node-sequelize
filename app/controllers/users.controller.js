const db = require("../models");
const jwt = require('jsonwebtoken');

const User = db.users;
const UserSession = db.user_session;

exports.create = (req, res) => {
    // Validate request
   
    if (!(req.body.email && req.body.password)){
      res.status(400).send({
        message: "Email or Password cannot be empty!"
      });
      return;
    }

    if (req.body.password.length <= 5){
      res.status(400).send({
        message: "Password cannot be lessthan 5 char!"
      });
      return;
    }

    // check if user alredy exist or not
    User.findAll({ where: { email: req.body.email } })
      .then(data => {
        //console.log(data.length);
        if (data.length >= 1){
          res.status(400).send({
            message: "User Already Exist!"
          });
          return;
        }
      });

   
  
    // Create a Tutorial
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      status: req.body.password ? req.body.password : false
    };
  
    // Save User in the database
    User.create(user)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the User."
        });
      });
  };

  exports.findOne = (req, res) => {
    const id = req.params.id;
  
    User.findByPk(id)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Tutorial with id=" + id
        });
      });
  };

  exports.doLogin = (req, res) => {
    console.log("doLogin");
    if (!(req.body.email && req.body.password)){
      res.status(400).send({
        message: "Email or Password cannot be empty!"
      });
      return;
    }

    User.findAll({ where: { email: req.body.email, password : req.body.password, status : 1 } })
      .then(data => {
        console.log(data[0].id);
        var userId = data[0].id;
        if (data.length >= 1){
          // generate authentication key
          let r = (Math.random() + 1).toString(36).substring(7);

          // update into user table
          UserSession.create({user_id:userId,authentication_key :r,session_status:0}).then(num => {
           
              res.status(200).send({
                message: "User available",
                authentication_link : "http://localhost:3000/api/users/acceptLogin/"+r+"/"+userId
              });
              return;
             
          })
          .catch(err => {
            res.status(500).send({
              message: "Error updating Tutorial with id=" + id
            });
          });

          
        }else{
          res.status(200).send({
            message: "User not available"
          });
          return;
        }
      })
      .catch(err => {
        console.log(err.message);
        // res.status(500).send({
        //   message: "Invalid email or password!"
        // });
      });
  };

  exports.acceptLogin = (req, res) => {
    const key = req.params.key;
    const userId = req.params.id;
    
    


    UserSession.findAll({ where: { user_id: userId, authentication_key : key, session_status : 0 } })
    .then(data => {
      

    
      
      if (data.length >= 1){
        // expire mins checking
        var endDate =  data[0].createdAt;
     
        var startTime = new Date(endDate); 
        var endTime = new Date();
        var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
        var resultInMinutes = Math.round(difference / 60000);

        if(resultInMinutes > process.env.AUTH_LINK_EXPIRE){
          res.status(400).send({
            message: "Authentication Link Expired!"
          });
          return;
        }

        var UserSessionId = data[0].id;
        // generate JWT token
        const token = jwt.sign(
          { user_id : userId, key },
          process.env.TOKEN_KEY,
          { expiresIn : process.env.AUTH_EXPIRE}
        )

        UserSession.update({session_status : 1, token : token}, {
          where: { id: UserSessionId }
        })
          .then(num => {
            if (num == 1) {
              res.status(200).send({
                message: "User login successfully"
              });
              return;
            } else {
              res.send({
                message: `Cannot update`
              });
            }
          })
          .catch(err => {
            res.status(500).send({
              message: err.message
            });
          });

        
      }else{
        res.status(400).send({
          message: "Authentication Link Expired!"
        });
      }
      })
  }

const db = require("../models");
const jwt = require('jsonwebtoken');

const User = db.users;
const UserSession = db.user_session;

exports.create = async (req, res) => {
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

    const userExist =  await User.findAll({ where: { email: req.body.email } });
    if (userExist.length >= 1){
      res.status(200).send({
        message: "User already Exist"
      });
      return;
    }

  
    // Create a user
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      status: req.body.status ? req.body.status : false
    };
  console.log(user);
    // Save User in the database
    User.create(user)
      .then(data => {
        res.status(200).send({
          message:  "Account has been created for user "+ req.body.name
        });
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

  exports.doLogin = async (req, res) => {
    console.log("doLogin");
    if (!(req.body.email && req.body.password)){
      res.status(400).send({
        message: "Email or Password cannot be empty!"
      });
      return;
    }

    const userExist =  await User.findAll({ where: { email: req.body.email } });
    if (userExist.length == 0){
      res.status(200).send({
        message: "Invalid User!"
      });
      return;
    }


    User.findAll({ where: { email: req.body.email, password : req.body.password, status : 1 } })
      .then(data => {
       
        
        if (data.length >= 1){
          var userId = data[0].id;

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
              message: "Error updating user"
            });
          });

          
        }else{
          var attempt = userExist[0].lock_user;
          console.log(attempt);
          
          if(attempt >= process.env.LOGIN_ATTEMPT){
            User.update({status : 0},{where : {id : userExist[0].id}})
            res.status(200).send({
              message: "Account Locked!"
            });
            return;
          }else{
             User.update({lock_user : attempt+1},{where : {id : userExist[0].id}})
            
            res.status(200).send({
              message: "Password incorrect!"
            });
            return;
          }
         
          
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
                message: "User login successfully",
                token : token
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
  };

    exports.userActivate = (req, res) => {
    const userId = req.params.id;
    User.update({status : 1,lock_user:0},{where : {id : userId}}).then(nums => {
      res.send({ message: `Account is enabled` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred ."
      });
    });
  };

  exports.getTimeApi = async (req, res) => {
    const token = req.params.token;
    console.log(token);
    try { 
      // check token validation
      const tokenExist =  await UserSession.findAll({ where: { token: token, session_status : 1 } });

      if(tokenExist.length == 0){
        res.status(401).send({ status: 'error', message: 'Unauthorized! Access Token was expired!' });
      }

      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      res.status(200).send({ status: 'success', message: 'Valid token', time : new Date() });
      return;
    } catch (error) {
      res.status(401).send({ status: 'error', message: 'Unauthorized! Access Token was expired!' });
      return;
    }  
  }

  exports.kickoutApi = async (req, res) => {
    const user = req.params.user;
    const userExist =  await User.findAll({ where: { email: user } });
    console.log(userExist);
    if(userExist.length > 0){
      UserSession.update({session_status : 0},{where : {user_id : userExist[0].id }}).then(nums => {
        res.send({ message: `All sessions are kicked out` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred ."
        });
      });
    }else{
      res.status(401).send({ status: 'error', message: 'Invalid User or user not found!' });
      return;
    }
  }

  

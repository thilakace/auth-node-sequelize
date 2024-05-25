module.exports = (sequelize, Sequelize) => {

    const User = sequelize.define("users", {
    
        name: {
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING
        },
        password: {
          type: Sequelize.STRING
        },
        authentication_key: {
            type: Sequelize.STRING
          },
        lock_user: {
           type: Sequelize.BOOLEAN
        },   
        status: {
          type: Sequelize.BOOLEAN
        }
    
    });
    
    return User;
    
    };
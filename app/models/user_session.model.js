module.exports = (sequelize, Sequelize) => {

    const UserSession = sequelize.define("user_session", {
    
      user_id: {
          type: Sequelize.INTEGER
        },
        authentication_key: {
            type: Sequelize.STRING
          },
        token: {
           type: Sequelize.STRING
        },   
        session_status: {
          type: Sequelize.BOOLEAN
        }
    
    });
    
    return UserSession;
    
    };
var db=require("./db_init.js");
var mysql      = require('mysql');

module.exports = 
{
  is_user_exist:function (user,callback) {
  	//sql=db.make_safe("select username from login where username=",user);
  	var sql="select username from login where username = ? ";
  	var bind=[user];
  	
  	db.db_query(sql,'SELECT',bind,function (err,result) {
  		if(err){
  			console.log(err);
  		}
  		else{
  			if(result.length>0)
  				callback(1);
  			else 
  				callback(0);

  			console.log('The solution is: ',result);
        }
  	});
  	
  	    },
  	insert_user:function(user_data,callback){
  		var sql="insert into login(username,password,email,active) values(?,?,?,?)";
  		var bind=user_data;
  		db.db_query(sql,'INSERT',bind,function(result){
  			if(result!=1){
  				 console.log(err);
  				 callback(0);
  				}
  				else{
  					console.log("----insertion successful");
  					callback(1);
  				}
  		});
  	},

    check_user:function (user,password,callback) {
    //sql=db.make_safe("select username from login where username=",user);
    var sql="select * from login where username = ? and password=?";
    var bind=[user,password];
    
    db.db_query(sql,'SELECT',bind,function (err,result) {
      if(err){
        console.log(err);
      }
      else{
        if(result.length>0)
          callback(result);
        else 
          callback(0);

        console.log('The solution is: ',result);
        }
    });
    
        },
  update_status:function(user,password,value,callback){
    var sql="update login set active=? where username = ? and password=?";
    var bind=[value,user,password];
    
    db.db_query(sql,'UPDATE',bind,function (result) {
    
        if(result==1)
          callback(1);
        else 
          callback(0);

        console.log('update ',result);
        });
  },
  check_status:function(user,callback){
    var sql="select username,active from login  username = ? ";
    var bind=[user];
    
    db.db_query(sql,'SELECT',bind,function (result) {
    
        if(result==1)
          callback(1);
        else 
          callback(0);

        console.log('update ',result);
        });
  }
  
};
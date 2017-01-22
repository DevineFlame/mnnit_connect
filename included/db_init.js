var mysql      = require('mysql');

function give_connection() {
	
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'rdymnnit',
  database : 'webrtc'
});

connection.connect();
return connection;
}



function end_connection(connection) {
	
connection.end();
}

module.exports = 
{ 
  db_query:function (sql,type,post,callback) {
  	 db=give_connection();
  	 var res=[];

  	 switch(type){
		case "SELECT": 
				//sql=mysql.format(sql,post);		
				var query=db.query(sql, post,function(err, rows, fields) {
					  if (!err){
					  	
					    //console.log('The solution is: ', rows);
					    
						callback(0,rows);

					}
					  else{
					    console.log('Error while performing Query.');
					    callback(err)
					}
					console.log(query.sql);
					});
		break;
		case "INSERT": //console.log(post);
					temp=db.query(sql,post,function(err){
					if(!err){
						console.log("insertion successful");
						callback(1);
					}
					else{
						console.log("insertion fails",temp.sql);
						callback(0);
					}
				});
		break;
		case "UPDATE": //console.log(post);
					temp=db.query(sql,post,function(err){
					if(!err){
						
						console.log("update successful",temp.sql);
						callback(1);
					}
					else{
						console.log("update fails",temp.sql);
						callback(0);
					}
				});


	}

		//end_connection(db);
}
  
};/*
module.exports{
function db_query(sql) {
	// body...
connection=give_connection();
connection.query('SELECT * from login', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.');
});

end_connection();
}
}*/
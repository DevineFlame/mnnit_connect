var express = require('express');

var db=require('../included/db_init.js');
var user_object=require('../included/user.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


/* GET home page. */
router.get('/signupform', function(req, res) {
  res.render('signupform');
});




router.post('/signup', function(req, res) {
 
  var user=req.body.user;
  var passwd=req.body.pass;
  var email=req.body.email;
  var post=[user,passwd,email,0];
 // console.log(post);
  user_object.is_user_exist(user,function(result){
    if(result===1){
      console.log("user exist----");
     res.send("user exist choose other name");
    }
    else {
      console.log("user does not exist");
      user_object.insert_user(post,function(result){
        if(result===1){
         console.log("inserted");
          res.render('index', {msg: 'signup_succes'});
         //res.redirect('index.html?msg=signup_success');
       }
         else{
            console.log("not inserted");
             res.render('index', {msg: 'signup_fails'});
           //res.redirect('error.html?msg=signup_fails');

         } 
      });
      
    }
  });
  
});



router.post('/login', function(req, res) {
 
  var user=req.body.user;
  var passwd=req.body.pass;

  var post=[user,passwd];
 // console.log(post);
  
      user_object.check_user(user,passwd,function(result){
        if(result.length>0){
         console.log("loging_successful");
        console.log(result[0].username); // set the sessions 

         req.session.user=result[0].username;
         req.session.passwd=result[0].password;
         req.session.active=result[0].active;
         req.session.email=result[0].email;

         console.log(req.session.user);

         user_object.update_status(user,passwd,1,function(result){

                     if(result==1)
                      console.log("user activated");
                    else{
                      console.log("user not activated");
                    }
         });
          res.render('home', {msg: 'login_succes',user:user});
        // res.redirect('home');
       }
         else{
            console.log("login failed");
             res.render('index', {msg: 'login failed'});
          // res.redirect('index.html?msg=login_fails');

         } 
      });
      
  
  });




router.get('/logout', function (req, res) {
  
          console.log("kuch to do",req.session.user);

  user_object.update_status(req.session.user,req.session.passwd,0,function(result){

                     if(result==1){
                      console.log("user deactivated");
                        req.session.destroy();
                        res.render('index',{msg:'logout_succesful'});
                    }
                    else{
                      console.log("user not deactivated");
                    }
         });
       
  
});
  



module.exports = router;

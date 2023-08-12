const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secret = "S3CR3T";
//function to create json web tokens
const generateJwt = (user) => {
  const payload = {username : user.username};
  return jwt.sign(payload,secret, {expiresIn : "1h"});
}

const authenticateJwt = (req ,res , next) =>{
  const authHeader = req.headers.authorization;

  if(authHeader){
    const token = authHeader.split(' ')[1];
    jwt.verify(token, secret, (err,user)=>{
      if(err){
        res.sendStatus(403);
      }
      req.user = user;
      next();
    })
  }else{
    return res.sendStatus(401);
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const existingAdmin = ADMINS.find( a=> a.username === admin.username);
  if(existingAdmin){
    res.status(404).json({message : "The admin already exists !!!"});
  }else{
    ADMINS.push(admin);
    const token = generateJwt(admin);
    res.json({message : "New admin created successfully !!", token : token});
  }
});

app.post('/admin/login', (req, res) => {
  const {username , password} = req.headers;
  const existingAdmin = ADMINS.find( a=> a.username === username);
  if(existingAdmin){
    const token = generateJwt(existingAdmin);
    res.json({message :"Logged in successfully !!", token : token});
  }else{
    res.status(404).json({message : "admin does not exists !"});
  }
});

app.post('/admin/courses', authenticateJwt,(req, res) => {
  // logic to create a course
  const course = req.body;
  course.id = COURSES.length + 1;
  COURSES.push(course);
  res.json({message:"Course added Successfully !!", courseId:course.id});
});

app.put('/admin/courses/:courseId', authenticateJwt,(req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find( a=> a.id === courseId);
  if(course){
    Object.assign(course,req.body);
    res.json({message:"Course updated successfully",courseId:course.id});
  }else{
    res.json({message : "Course not found !"});
  }  
});

app.get('/admin/courses', authenticateJwt,(req, res) => {
  res.json({courses : COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  const user = req.body;
  const existingUser = USERS.find(a => a.username === username);
  if(existingUser){
    res.status(404).json({message :"The user already exists!!"});
  }else{
    const token = generateJwt(user);
    USERS.push(user);
    res.json({message : "User added Successfully!", token : token});
  }
});

app.post('/users/login', (req, res) => {
  const {username, password} = req.headers;
  const existingUser = USERS.find(a => a.username === username && a.password === password);
  if(existingUser){
    const token = generateJwt(existingUser);
    res.json({message : "Logged in successfully !!", token : token});
  }else{
    res.status(404).json({message : "The user does not exists !!"});
  }
});

app.get('/users/courses', authenticateJwt,(req, res) => {
  // logic to list all courses
  res.json({courses : COURSES});
});

app.post('/users/courses/:courseId', authenticateJwt,(req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if (course) {
    const user = USERS.find(u => u.username === req.user.username);
    if (user) {
      if (!user.purchasedCourses) {
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      res.json({ message: 'Course purchased successfully' });
    } else {
      res.status(403).json({ message: 'User not found' });
    }
  } else {
    res.status(404).json({ message: 'Course not found' });
  }

});

app.get('/users/purchasedCourses', (req, res) => {
  const user = USERS.find(u => u.username === req.user.username);
  if (user && user.purchasedCourses) {
    res.json({ purchasedCourses: user.purchasedCourses });
  } else {
    res.status(404).json({ message: 'No courses purchased' });
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

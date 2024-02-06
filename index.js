require('dotenv').config()
const express=require('express');
const app=express();
const PORT=process.env.PORT || 3001;
const bodyParser=require('body-parser');
const cookieParser=require("cookie-parser")

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

app.use(express.static('public'))
app.use(express.static('uploads'))
app.use('/blog', express.static('public'));
app.use('/blog', express.static('uploads'));
app.use('/dashboard', express.static('public'));
app.use('/dashboard', express.static('uploads'));
app.use('/dashboard/updateBlog', express.static('public'));


app.set('view engine', "ejs")

app.use('/', require('./routes/router'))


app.listen(PORT, ()=>{
    console.log(`App is listenig on ${PORT}`)
})
const express = require('express');
const mongoose = require('mongoose');
//const dotenv = require('dotenv');
//const userRoutes = require('./routes/users');

const app = express();
const connect = mongoose.connect('mongodb://127.0.0.1:27017/BookDB');
connect.then(()=>{
    console.log("database connected");
}
)
.catch((err)=>{
    console.log("Not connected",err);
})

const PORT =  3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
//const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoute');

const app = express();
const connect = mongoose.connect('mongodb://host.docker.internal:27017/UserDB');
connect.then(()=>{
    console.log("database connected");
}
)
.catch((err)=>{
    console.log("Not connected",err);
})

app.use(express.json());
app.get('/',async (req,res)=>{
    res.send("User service active")
});
app.use('/api/users', userRoutes);

const PORT =  3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

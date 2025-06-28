const express = require('express');
const mongoose = require('mongoose');
//const dotenv = require('dotenv');
const loanRoutes = require('./routes/loanRoute');

const app = express();
const connect = mongoose.connect('mongodb://mongodb:27017/LoanDB');
connect.then(()=>{
    console.log("database connected");
}
)
.catch((err)=>{
    console.log("Not connected",err);
})
app.use(express.json());
app.get('/',async (req,res)=>{
    res.send("Loan service active")
});
app.use('/api/loans', loanRoutes);
const PORT =  3003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

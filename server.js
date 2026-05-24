const express = require("express");
const testRoutes = require("./routes/test.routes");
const authRoutes = require('./routes/auth.routes');

const PORT = 5000;
const api = express();

api.use(express.json());
api.use(express.static("public"));
api.use('/dao', express.static('dao'));
api.use('/env', express.static('env'));

api.use("/test", testRoutes);
api.use('/auth', authRoutes); 

api.listen(PORT, ()=>{
    console.log("Server running in http://localhost:5000")
});
const mongoose = require("mongoose");
require('dotenv').config()
const connectDB = () => {
  try {
    mongoose.connect(process.env.MONGO_URI)
<<<<<<< HEAD
    .then(() => console.log("Database Connected Successfully"));
  } catch (err) {
    console.log(err.message);
  }

=======
    .then( () => console.log("Database connected successfully"))
    .catch( err => console.log("Database Connection Failed ", err.message));
  } catch (e) {
    console.log("Database connection error ",e.message);
  }
>>>>>>> origin/master
};

module.exports = connectDB;

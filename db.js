import { config } from "dotenv";
import { connect } from "mongoose";

config();
const URI = process.env.MONGODB_URI;

export const connectToMongo = async () => {
  await connect(URI)
    .then(() => {
      console.log("Connected to mongoDB Succesfully");
    })
    .catch((error) => {
      console.log("Failed to Connect to mongoDB" + error);
    });
};

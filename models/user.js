import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    maxLength: 100,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["guest", "user", "author"],
    required: true,
  },
});

export default mongoose.model("User", UserSchema);
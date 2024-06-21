import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema({
  body: {
    type: String,
    maxLength: 550,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
});

export default mongoose.model("Comment", CommentSchema);
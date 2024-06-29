import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema({
  title: {
    type: String,
    maxLength: 400,
    required: true,
  },
  subheader: {
    type: String,
  },
  body: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    }
  ],
  imageurl: {
    type: String,
    required: true,
  },
  isPublished: {
    type: Boolean,
    required: true,
  },
  publishDate: {
    type: Date,
    required: function () { return this.isPublished },
  },
  editDate: {
    type: Date,
  },
});

export default mongoose.model("Post", PostSchema);
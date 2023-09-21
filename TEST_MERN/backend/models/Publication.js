import mongoose from "mongoose";

const { Schema } = mongoose;

let publicationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    authors: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    topic: {
      type: Array,
    },
    url: {
      type: String,
    },
    doi: {
      type: String
    }
  },
  { timestamps: true }
);

const Publication = mongoose.model("publication", publicationSchema);

export default Publication;

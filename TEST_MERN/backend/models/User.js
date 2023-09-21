import mongoose from "mongoose";

const { Schema } = mongoose;

let userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an Email!"],
      unique: [true, "Email Exist"],
    },
    password: {
      type: String,
      required: false,
      unique: false,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    confirmationToken: { 
        type: String 
    },
    isConfirmed: { 
        type: Boolean, 
        default: false 
    },
    tokenExpiration: { 
        type: Date 
    }
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

export default User;
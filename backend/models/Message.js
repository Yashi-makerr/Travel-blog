// backend/models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
    },
  },
  { timestamps: true } // createdAt, updatedAt auto add
);

module.exports = mongoose.model("Message", messageSchema);

const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    story: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    aiSummary: {
      type: String,
      trim: true,
    },
    aiCategory: {
      type: String,
      trim: true,
    },
    aiTags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  content: string;

  img: string;

  isActive: boolean;
  createdAt: Date;

}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text search index
BlogSchema.index({ title: "text", content: "text" });
BlogSchema.index({ createdAt: -1 });

export default mongoose.models.Blog ||
  mongoose.model<IBlog>("Blog", BlogSchema,'blog');

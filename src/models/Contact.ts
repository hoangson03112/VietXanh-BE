import mongoose, { Schema, Document } from "mongoose";

export interface IContactProduct {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  address?: string;
  message: string;
  products?: IContactProduct[];
  totalAmount?: number;
  totalItems?: number;
  status: "new" | "read" | "replied";
  reply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactProductSchema = new Schema<IContactProduct>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    products: {
      type: [ContactProductSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    totalItems: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

ContactSchema.index({ createdAt: -1 });

export default mongoose.models.Contact ||
  mongoose.model<IContact>("Contact", ContactSchema, "contact");

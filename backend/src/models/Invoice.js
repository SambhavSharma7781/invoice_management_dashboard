import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^INV-\d{7}$/, "Invalid invoiceId format"],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    taxRate: {
      type: Number,
      required: true,
      enum: [0, 3, 5, 18, 28],
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Sent", "Unpaid", "Overdue", "Paid", "Void", "Draft"],
    },
    issueDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          if (!this.issueDate) {
            return true;
          }
          return value >= this.issueDate;
        },
        message: "Due date must be on or after issue date",
      },
    },
  },
  { timestamps: true }
);

invoiceSchema.index({ customerId: 1 });
invoiceSchema.index({ issueDate: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ customerId: 1, issueDate: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;

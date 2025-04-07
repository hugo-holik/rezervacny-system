const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    datefrom: { type: Date, required: true },
    dateto: { type: Date, required: true },
    dateClosing: { type: Date, required: true },
    openExercises: [
      {
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        exercise: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        exerciseName: { type: String },
        attendees: [
          {
            teacher: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            numOfAttendees: { type: Number, required: true },
            approvalStatus: { type: String },
            createdAt: { type: Date, default: Date.now },
            approvedAt: { type: Date },
          },
        ],
        status: { type: String, default: "čaká na schválenie" },
        note: { type: String, required: false },
      },
    ],
  },
  { timestamps: true }
);

EventSchema.pre("save", function (next) {
  if (!this.isModified("approvalStatus")) return next();
  this.approvedAt = new Date();
  next();
});

module.exports = mongoose.model("Event", EventSchema);

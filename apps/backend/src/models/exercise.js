const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    program: { type: String, required: true },
    description: { type: String, required: false },
    room: { type: String, required: true },
    leads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

        // validate: {
        //   validator: async function (value) {
        //     const user = await this.model("User").findById(value);
        //     return user && user.role === "employee";
        //   },
        //   message: "Vyučujúci musí byť zamestnanec univerzity",
        // },
      },
    ],
    duration: { type: Number, required: true },
    startTimes: [{ type: String, required: true }],
    maxAttendees: { type: Number, required: true },
    color: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", ExerciseSchema);

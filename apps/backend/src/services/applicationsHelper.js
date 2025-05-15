exports.buildApplicationsData = async (events, exercises, filters = {}) => { 

  const applications = [];

  for (const event of events) {
    for (const openExercise of event.openExercises) {
      for (const attendee of openExercise.attendees) {

        if (filters.teacherId && attendee.teacher.toString() !== filters.teacherId.toString()) {
          continue;
        }
        if (filters.colleagueIds) {
          if (!filters.colleagueIds.some(id => id.toString() === attendee.teacher.toString())) {
            continue;
          }
        }
        const exerciseDate = new Date(openExercise.date);
        if (filters.filterFromDate && exerciseDate > new Date(filters.filterFromDate)) {
          continue;
        }

        const eventData = {
          date: openExercise.date,
          startTime: openExercise.startTime,
          numOfAttendees: attendee.numOfAttendees,
          approvalState: attendee.approvalStatus,
          eventId: event._id,
          dateClosing: event.dateClosing,
          exerciseId: openExercise._id,
          applicationId: attendee._id,
          createdAt: attendee.createdAt,
          approvedAt: attendee.approvedAt,
        };

        const foundExercise = exercises.find(
          (e) => e._id.toString() === openExercise.exercise.toString()
        );
        if (foundExercise) {
          eventData.maxAttendees = foundExercise.maxAttendees;
          eventData.exerciseName = foundExercise.name;
        }

        applications.push(eventData);
      }
    }
  }

  return applications;
};

import * as authService from '@app/pages/auth/authService';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = authService.geTokenFromStorage();
    if (token) {
      headers.set('x-access-token', token);
    }
    return headers;
  }
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [],
  endpoints: (builder) => ({
    getUserMe: builder.query({
      query: () => ({
        url: '/user/current',
        method: 'GET'
      })
    }),
    changeUserPassword: builder.mutation({
      query: (data) => ({
        url: '/user/change-password',
        method: 'PUT',
        body: { password: data.password }
      }),
      transformErrorResponse: (response) => {
        // Handle array of errors or single error message
        if (response.data?.errors) {
          return {
            messages: response.data.errors.map(err => err.message),
            fields: response.data.errors.reduce((acc, err) => {
              acc[err.path] = err.message;
              return acc;
            }, {})
          };
        }
        return {
          messages: [response.data?.message || 'Password change failed'],
          fields: {}
        };
      }
    }),
    loginUser: builder.mutation({
      query: (data) => ({
        url: '/public/signin',
        method: 'POST',
        body: data
      })
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: '/admin/user',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Users'] : [])
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `/admin/user/${data.userId}`,
        method: 'PUT',
        body: data.data
      }),
      invalidatesTags: (result) => (result ? ['Users'] : [])
    }),

    removeUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/user/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Users']
    }),
    //
    getUsersList: builder.query({
      query: () => ({
        url: '/admin/getAllUser',
        method: 'GET'
      }),
      providesTags: ['Users']
    }),
    getAllExternalSchools: builder.query({
      query: (data) => ({
        url: '/externalSchool',
        method: 'GET',
        body: data
      }),
      providesTags: ['ExternalSchools']
    }),
    getExternalSchoolById: builder.query({
      query: (Id) => ({
        url: `/externalSchool/${Id}`,
        method: 'GET',
      }),
      providesTags: ['ExternalSchools']
    }),
    createExternalSchool: builder.mutation({
      query: (data) => ({
        url: '/externalSchool',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['ExternalSchools'] : [])
    }),
    editExternalSchool: builder.mutation({
      query: ({ Id, ...data }) => ({
        url: `/externalSchool/${Id}`,
        method: 'PUT',
        body: data // Send only updated fields
      }),
      invalidatesTags: (result) => (result ? ['ExternalSchools'] : [])
    }),
    deleteExternalSchool: builder.mutation({
      query: (id) => ({
        url: `/externalSchool/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['ExternalSchools']
    }),
    getAllExercises: builder.query({
      query: (data) => ({
        url: '/exercise',
        method: 'GET',
        body: data
      }),
      providesTags: ['Exercises']
    }),
    createExercise: builder.mutation({
      query: (data) => ({
        url: '/exercise',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Exercises'] : [])
    }),
    editExercise: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exercise/${id}`, // `id` lowercase to match naming convention
        method: 'PUT',
        body: data // Just the updated fields
      }),
      invalidatesTags: (result) => (result ? ['Exercise'] : [])
    }),
    deleteExercise: builder.mutation({
      query: (id) => ({
        url: `/exercise/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Exercise']
    }),
    getAllEvents: builder.query({
      query: (data) => ({
        url: '/event',
        method: 'GET',
        body: data
      }),
      providesTags: ['Events']
    }),
    getEventById: builder.query({
      query: ({ Id, ...data }) => ({
        url: `/event/${Id}`,
        method: 'GET',
        body: data
      }),
      providesTags: ['Events']
    }),
    createEvent: builder.mutation({
      query: (data) => ({
        url: '/event',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Events'] : [])
    }),
    editEvent: builder.mutation({
      query: ({ Id, ...data }) => ({
        url: `/event/${Id}`,
        method: 'PUT',
        body: data // Send only updated fields
      }),
      invalidatesTags: (result) => (result ? ['Events'] : [])
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/event/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Events']
    }),
    addEventExercise: builder.mutation({
      query: ({ Id, ...data }) => ({
        url: `/event/addExercise/${Id}`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Events'] : [])
    }),
    editEventExercise: builder.mutation({
      query: ({ eventId, exerciseId, ...data }) => ({
        url: `/event/editExercise/${eventId}/${exerciseId}`,
        method: 'PUT',
        body: data // Send only updated fields
      }),
      invalidatesTags: (result) => (result ? ['Events'] : [])
    }),
    deleteEventExercise: builder.mutation({
      query: (eventId, exerciseId) => ({
        url: `/event/removeExercise/${eventId}/${exerciseId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Events']
    }),
    updateAttendeeStatus: builder.mutation({
      query: ({ eventId, exerciseId, attendeeId, status }) => ({
        url: `/event/updateAttendeeStatus/${eventId}/${exerciseId}/${attendeeId}`,
        method: 'PUT',
        body: { status },
        invalidatesTags: (result) => (result ? ['Events'] : [])
      }),
    }),
    sendApplication: builder.mutation({
      query: ({ eventId, exerciseId, ...data }) => ({
        url: `/event/sendApplication/${eventId}/${exerciseId}`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Events'] : [])
    }),
    getApplications: builder.query({
      query: (data) => ({
        url: '/event/getApplications',
        method: 'GET',
        body: data
      }),
      providesTags: ['Events']
    }),
    editApplication: builder.mutation({
      query: ({ eventId, exerciseId, applicationId, ...data }) => ({
        url: `/event/editApplication/${eventId}/${exerciseId}/${applicationId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result) => (result ? ['Events'] : [])
    }),
    deleteApplication: builder.mutation({
      query: (eventId, exerciseId, applicationId) => ({
        url: `/event/deleteApplication/${eventId}/${exerciseId}/${applicationId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Events']
    })
  })
});

export const {
  useGetUserMeQuery,
  useLazyGetUserMeQuery,
  useLoginUserMutation,
  useGetUsersListQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useRemoveUserMutation,
  useGetAllExternalSchoolsQuery,
  useGetExternalSchoolByIdQuery,
  useCreateExternalSchoolMutation,
  useEditExternalSchoolMutation,
  useDeleteExternalSchoolMutation,
  useGetAllExercisesQuery,
  useCreateExerciseMutation,
  useEditExerciseMutation,
  useDeleteExerciseMutation,
  useGetAllEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useEditEventMutation,
  useDeleteEventMutation,
  useAddEventExerciseMutation,
  useEditEventExerciseMutation,
  useDeleteEventExerciseMutation,
  useUpdateAttendeeStatusMutation,
  useAddExerciseToEventMutation,
  useChangeUserPasswordMutation,
  useSendApplicationMutation,
  useGetApplicationsQuery,
  useDeleteApplicationMutation,
  useEditApplicationMutation
} = api;

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
      query: ({ Id, ...data }) => ({
        url: `/exercise/${Id}`,
        method: 'PUT',
        body: data // Send only updated fields
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
      query: ({Id, ...data}) => ({
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
      }),
    }),
    addExerciseToEvent: builder.mutation({
      query: ({ eventId, newExercise }) => ({
        url: `/event/addExercise/${eventId}`,
        method: 'POST',
        body: newExercise,
      }),
      invalidatesTags: ['Events'],
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
  useAddExerciseToEventMutation
} = api;

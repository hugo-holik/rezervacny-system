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
  useCreateExternalSchoolMutation,
  useEditExternalSchoolMutation,
  useDeleteExternalSchoolMutation
} = api;

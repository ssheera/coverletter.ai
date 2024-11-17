/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type User = {
  __typename: "User",
  email?: string | null,
  uid: string,
  coverLetters?:  Array<CoverLetter | null > | null,
};

export type CoverLetter = {
  __typename: "CoverLetter",
  company: string,
  content: string,
  date: number,
  job: string,
};

export type GetUserQueryVariables = {
  uid: string,
};

export type GetUserQuery = {
  getUser?:  {
    __typename: "User",
    email?: string | null,
    uid: string,
    coverLetters?:  Array< {
      __typename: "CoverLetter",
      company: string,
      content: string,
      date: number,
      job: string,
    } | null > | null,
  } | null,
};

import { gql } from "apollo-server";

// typeDefs are used to create schema, here we are creating Query having greet schema.
// schema type is defined
const typeDefs = gql`
  type Query {
    users: [User]
    user(_id: ID!): User
    quotes: [Quote]
    iquote(by: ID!): [Quote]
  }

  type User {
    _id: ID!
    firstName: String
    lastName: String
    email: String
    quotes: [Quote]
  }

  type Quote {
    name: String
    by: ID
  }

  type Token {
    token: String
  }

  type Mutation {
    signUpUser(userNew: UserInput!): User
    signInUser(userSignIn: UserSignInInput!): Token
  }

  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  input UserSignInInput {
    email: String!
    password: String!
  }
`;

export default typeDefs;

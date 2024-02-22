import { users, quotes } from "./fakedb.js";
import { randomBytes } from "crypto";

// to respond to queries we need resolvers.
// first argument is parent & since its at root level we get undefined, therefore passing '_'
const resolvers = {
  Query: {
    users: () => users,
    user: (_, args) => users.find((user) => user._id === args._id),
    quotes: () => quotes,
    iquote: (_, args) => quotes.filter((quote) => quote.by == args.by),
  },
  // Below User is used to resolve quotes associated with a particular User.
  User: {
    // inside quotes we receive parents i.e Users
    quotes: (user) => quotes.filter((quote) => quote.by == user._id),
  },

  Mutation: {
    signUpUser: (_, { userNew }) => {
      const _id = randomBytes(5).toString("hex");
      users.push({
        _id,
        ...userNew,
      });
      return users.find((user) => user._id === _id);
    },
  },
};

export default resolvers;

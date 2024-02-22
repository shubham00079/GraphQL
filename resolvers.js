import { users, quotes } from "./fakedb.js";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const User = mongoose.model("User");

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
    signUpUser: async (_, { userNew }) => {
      const user = await User.findOne({ email: userNew.email });
      if (user) {
        throw new Error("User already exists with that email.");
      }
      // bcrypt.hash returns a promise
      const hashedPassword = await bcrypt.hash(userNew.password, 12);

      // spreadOperator since we are updating hashed password
      const newUser = new User({
        ...userNew,
        password: hashedPassword,
      });
      await newUser.save();
      return newUser;
      // return newUser.save();
    },
  },
};

export default resolvers;

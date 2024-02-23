import { users, quotes } from "./fakedb.js";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";
import { error } from "console";

const User = mongoose.model("User");
const Quote = mongoose.model("Quote");

// to respond to queries we need resolvers.
// first argument is parent & since its at root level we get undefined, therefore passing '_'
const resolvers = {
  Query: {
    // users: () => users,
    // user: (_, args) => users.find((user) => user._id === args._id),
    // quotes: () => quotes,
    // iquote: (_, args) => quotes.filter((quote) => quote.by == args.by),

    users: async () => await User.find({}),
    user: async (_, args) => await User.findOne({ _id: args._id }),
    quotes: async () => await Quote.find({}),
    iquote: async (_, args) => await Quote.find({ by: args.by }),
  },
  // Below User is used to resolve quotes associated with a particular User.
  // linked to "getAllUsers"
  User: {
    // inside quotes we receive parents i.e Users
    // quotes: (user) => quotes.filter((quote) => quote.by == user._id),
    quotes: async (user) => await Quote.find({ by: user._id }),
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

    signInUser: async (_, { userSignIn }) => {
      const user = await User.findOne({ email: userSignIn.email });
      if (!user) {
        throw new Error("User does not exist, please SignUp first.");
      }
      const doMatch = await bcrypt.compare(userSignIn.password, user.password);
      if (!doMatch) {
        throw new Error("Email or Password invalid.");
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      return { token: token };
    },
    // 1st param is for parent, 2nd is for arguments, 3rd is context
    // to apply middleware/context just write in serverjs and it will
    // automatically take the value.
    createQuote: async (_, { name }, { userId }) => {
      // TODO
      if (!userId) throw new Error("You must be logged In.");

      // Whenever saving into DB, use new collection name({})
      // then we need to save it.
      // then can return
      const newQuote = new Quote({
        name: name,
        by: userId,
      });

      await newQuote.save();
      return "Quote Saved Successfully.";
    },
  },
};

export default resolvers;

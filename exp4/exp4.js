// EXPERIMENT 4: Create a Basic GraphQL API Using Express.js

// 1. Import Required Modules
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} = require("graphql");

// 2. Create Express Application
const app = express();

// 3. Define Student Object Type
const StudentType = new GraphQLObjectType({
  name: "Student",
  fields: {
    name: {
      type: GraphQLString
    },
    course: {
      type: GraphQLString
    }
  }
});

// 4. Define Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    student: {
      type: StudentType,
      resolve: () => {
        return {
          name: "Krishna",
          course: "B.Tech CSE"
        };
      }
    }
  }
});

// 5. Define GraphQL Schema
const schema = new GraphQLSchema({
  query: RootQuery
});

// 6. Create GraphQL API Endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true
  })
);

// 7. Start the Server
app.listen(4000, () => {
  console.log("GraphQL Server running on port 4000");
});

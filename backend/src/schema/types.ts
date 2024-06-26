// const graphql = require("graphql");
// const { GraphQLObjectType, GraphQLString, GraphQLInt } = graphql;

// const UserType = new GraphQLObjectType({
//   name: "User",
//   type: "Query",
//   fields: {
//     id: { type: GraphQLString },
//     username: { type: GraphQLString },
//     email: { type: GraphQLString },
//     joined: { type: GraphQLString },
//     last_logged_in: { type: GraphQLString },
//   },
// });

// const ProjectType = new GraphQLObjectType({
//   name: "Project",
//   type: "Query",
//   fields: {
//     id: { type: GraphQLString },
//     creator_id: { type: GraphQLString },
//     created: { type: GraphQLString },
//     title: { type: GraphQLString },
//     description: { type: GraphQLString },
//   },
// });

// const BidsType = new GraphQLObjectType({
//   name: "Bids",
//   type: "Query",
//   fields: {
//     bid_id: { type: GraphQLInt },
//     user_id: { type: GraphQLInt },
//     stock_id: { type: GraphQLInt },
//     quantity: { type: GraphQLInt },
//     bid_price: { type: GraphQLInt },
//   },
// });

// exports.UserType = UserType;
// exports.ProjectType = ProjectType;

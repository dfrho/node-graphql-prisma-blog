import { GraphQLServer } from 'graphql-yoga';

// Demo Data
const usersData = [
  {
    id: '123456',
    name: 'David Rhodes',
    email: 'rhodesdav@gmail.com',
    age: 56,
  },
  {
    id: '1234567',
    name: 'Shelly Schwentker',
    email: 'shelly@gmail.com',
    age: 53,
  },
  {
    id: '12345678',
    name: 'Lisa Carver',
    email: 'lmcatt@gmail.com',
    age: 57,
  },
];

const postsData = [
  {
    id: 123,
    title: 'Pandemic Workflows',
    body: 'Lorem Hipster Ipsum espresso',
    published: false,
    author: '123456',
  },
  {
    id: 124,
    title: 'Pandemic Relationships',
    body: 'Lorem Hipster social distancing nespresso',
    published: false,
    author: '1234567',
  },
  {
    id: 125,
    title: 'Pandemic Pet Adoption',
    body: 'Lorem Woofster Ipsum reindeer antlers',
    published: true,
    author: '12345678',
  },
];

// Type Definitions (Schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
        post: Post!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
    }
`;

// Resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return usersData;
      }
      return usersData.filter((user) =>
        user.name.toLowerCase().includes(args.query.toLowerCase())
      );
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return postsData;
      }
      return postsData.filter(
        (post) =>
          post.title.toLowerCase().includes(args.query.toLowerCase()) ||
          post.body.toLowerCase().includes(args.query.toLowerCase())
      );
    },
    me() {
      return {
        id: '123098',
        name: 'David Rhodes',
        email: 'david@espressocode.tech',
        age: 56,
      };
    },
    post() {
      return {
        id: '12345',
        title: 'Pandemic Workflows',
        body: 'Lorem Hipster ipsum coffee nespresso dudes.',
        published: false,
      };
    },
  },
  Post: {
    author(parent, args, ctx, info) {
      return usersData.find((user) => {
        return user.id === parent.author;
      });
    },
  },
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
});

server.start(() => {
  console.log('The server is up and running.');
});

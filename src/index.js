import { GraphQLServer } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';

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
    id: '123',
    title: 'Pandemic Workflows',
    body: 'Lorem Hipster Ipsum espresso',
    published: true,
    author: '123456',
  },
  {
    id: '124',
    title: 'Pandemic Relationships',
    body: 'Lorem Hipster social distancing nespresso',
    published: false,
    author: '1234567',
  },
  {
    id: '125',
    title: 'Pandemic Pet Adoption',
    body: 'Lorem Woofster Ipsum reindeer antlers',
    published: true,
    author: '12345678',
  },
];

const commentsData = [
  {
    id: 1,
    text: 'This is awesome!',
    author: '123456',
    post: 123,
  },
  {
    id: 2,
    text: 'This is neat!',
    author: '12345678',
    post: 125,
  },
];

// Type Definitions (Schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments(query: String): [Comment!]!
        me: User!
        post: Post!
    }

    type Mutation {
        createUser(user: CreateUserInput!): User!
        createPost(post: CreatePostInput!): Post!
        createComment(comment: CreateCommentInput!): Comment!
    }

    input CreateUserInput {
        name: String! 
        email: String!
        age: Int
    }

    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
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
    comments(parent, args, ctx, info) {
      if (!args.query) {
        return commentsData;
      }
      return commentsData.filter((comment) =>
        comment.text.toLowerCase().includes(args.query.toLowerCase())
      );
    },
    me() {
      return {
        id: '123098',
        name: 'David Rhodes',
        email: 'david@espressocode.tech',
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
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = usersData.some(
        (user) => args.user.email === user.email
      );
      if (emailTaken) {
        throw new Error('email is already in use');
      }

      const newUser = {
        id: uuidv4(),
        ...args.user,
      };

      usersData.push(newUser);

      return newUser;
    },
    createPost(parent, args, ctx, info) {
      const userExists = usersData.some((user) => {
        return user.id === args.post.author;
      });

      if (!userExists) throw new Error('User does not exist');

      const newPost = {
        id: uuidv4(),
        ...args.post,
      };

      postsData.push(newPost);

      return newPost;
    },
    createComment(parent, args, ctx, info) {
      const userExists = usersData.some(
        (user) => user.id === args.comment.author
      );
      const postExists = postsData.some(
        (post) => post.id === args.comment.post && post.published
      );

      if (!userExists || !postExists) {
        throw new Error('Unable to find user or post');
      }

      const newComment = {
        id: uuidv4(),
        ...args.comment,
      };

      commentsData.push(newComment);

      return newComment;
    },
  },
  Post: {
    author(parent, args, ctx, info) {
      return usersData.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, ctx, info) {
      return commentsData.filter((comment) => {
        return comment.post === parent.id;
      });
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      return usersData.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return postsData.find((post) => {
        return post.id === parent.post;
      });
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return postsData.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return commentsData.filter((comment) => {
        return comment.author === parent.id;
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

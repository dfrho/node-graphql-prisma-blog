import { GraphQLServer } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';
import db from './db';

// Resolvers
const resolvers = {
  Query: {
    users(parent, args, { db }, info) {
      if (!args.query) {
        return db.usersData;
      }
      return db.usersData.filter((user) =>
        user.name.toLowerCase().includes(args.query.toLowerCase())
      );
    },
    posts(parent, args, { db }, info) {
      if (!args.query) {
        return db.postsData;
      }
      return db.postsData.filter(
        (post) =>
          post.title.toLowerCase().includes(args.query.toLowerCase()) ||
          post.body.toLowerCase().includes(args.query.toLowerCase())
      );
    },
    comments(parent, args, { db }, info) {
      if (!args.query) {
        return db.commentsData;
      }
      return db.commentsData.filter((comment) =>
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
    createUser(parent, args, { db }, info) {
      const emailTaken = db.usersData.some(
        (user) => args.user.email === user.email
      );
      if (emailTaken) {
        throw new Error('email is already in use');
      }

      const newUser = {
        id: uuidv4(),
        ...args.user,
      };

      db.usersData.push(newUser);

      return newUser;
    },
    deleteUser(parent, args, { db }, info) {
      const userIndex = db.usersData.findIndex((user) => user.id === args.id);
      if (userIndex === -1) throw new Error('User does not exist.');

      const deletedUser = db.usersData.splice(userIndex, 1)[0];

      db.postsData = db.postsData.filter((post) => {
        const match = post.author === args.id;

        if (match) {
          db.commentsData = db.commentsData.filter(
            (comment) => comment.post !== post.id
          );
        }

        return !match;
      });

      db.commentsData = db.commentsData.filter(
        (comment) => comment.author !== args.id
      );

      return deletedUser;
    },
    createPost(parent, args, { db }, info) {
      const userExists = db.usersData.some((user) => {
        return user.id === args.post.author;
      });

      if (!userExists) throw new Error('User does not exist');

      const newPost = {
        id: uuidv4(),
        ...args.post,
      };

      db.postsData.push(newPost);

      return newPost;
    },
    deletePost(parent, args, { db }, info) {
      const postIndex = db.postsData.findIndex((post) => post.id === args.id);

      if (postIndex === -1) throw new Error('Post does not exist.');
      const deletedPost = db.postsData.splice(postIndex, 1)[0];

      db.commentsData = db.commentsData.filter(
        (comment) => comment.post !== args.id
      );

      return deletedPost;
    },
    createComment(parent, args, { db }, info) {
      const userExists = db.usersData.some(
        (user) => user.id === args.comment.author
      );
      const postExists = db.postsData.some(
        (post) => post.id === args.comment.post && post.published
      );

      if (!userExists || !postExists) {
        throw new Error('Unable to find user or post');
      }

      const newComment = {
        id: uuidv4(),
        ...args.comment,
      };

      db.commentsData.push(newComment);

      return newComment;
    },
    deleteComment(parent, args, { db }, info) {
      const commentIndex = db.commentsData.findIndex(
        (comment) => comment.id === args.id
      );

      if (commentIndex === -1) throw new Error('Comment does not exist.');

      const deletedComment = db.commentsData.splice(commentIndex, 1)[0];

      return deletedComment;
    },
  },
  Post: {
    author(parent, args, { db }, info) {
      return db.usersData.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, { db }, info) {
      return db.commentsData.filter((comment) => {
        return comment.post === parent.id;
      });
    },
  },
  Comment: {
    author(parent, args, { db }, info) {
      return db.usersData.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, { db }, info) {
      return db.postsData.find((post) => {
        return post.id === parent.post;
      });
    },
  },
  User: {
    posts(parent, args, { db }, info) {
      return db.postsData.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, { db }, info) {
      return db.commentsData.filter((comment) => {
        return comment.author === parent.id;
      });
    },
  },
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    db,
  },
});

server.start(() => {
  console.log('The server is up and running.');
});

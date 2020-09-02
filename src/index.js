import { GraphQLServer } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';

// Demo user data
let usersData = [
  {
    id: '1',
    name: 'Andrew',
    email: 'andrew@example.com',
    age: 27,
  },
  {
    id: '2',
    name: 'Sarah',
    email: 'sarah@example.com',
  },
  {
    id: '3',
    name: 'Mike',
    email: 'mike@example.com',
  },
];

let postsData = [
  {
    id: '10',
    title: 'GraphQL 101',
    body: 'This is how to use GraphQL...',
    published: true,
    author: '1',
  },
  {
    id: '11',
    title: 'GraphQL 201',
    body: 'This is an advanced GraphQL post...',
    published: false,
    author: '1',
  },
  {
    id: '12',
    title: 'Programming Music',
    body: '',
    published: true,
    author: '2',
  },
];

let commentsData = [
  {
    id: '102',
    text: 'This worked well for me. Thanks!',
    author: '3',
    post: '10',
  },
  {
    id: '103',
    text: 'Glad you enjoyed it.',
    author: '1',
    post: '10',
  },
  {
    id: '104',
    text: 'This did no work.',
    author: '2',
    post: '11',
  },
  {
    id: '105',
    text: 'Nevermind. I got it to work.',
    author: '1',
    post: '12',
  },
];

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
    deleteUser(parent, args, ctx, info) {
      const userIndex = usersData.findIndex((user) => user.id === args.id);
      if (userIndex === -1) throw new Error('User does not exist.');

      const deletedUser = usersData.splice(userIndex, 1)[0];

      postsData = postsData.filter((post) => {
        const match = post.author === args.id;

        if (match) {
          commentsData = commentsData.filter(
            (comment) => comment.post !== post.id
          );
        }

        return !match;
      });

      commentsData = commentsData.filter(
        (comment) => comment.author !== args.id
      );

      return deletedUser;
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
    deletePost(parent, args, ctx, info) {
      const postIndex = postsData.findIndex((post) => post.id === args.id);

      if (postIndex === -1) throw new Error('Post does not exist.');
      const deletedPost = postsData.splice(postIndex, 1)[0];

      commentsData = commentsData.filter((comment) => comment.post !== args.id);

      return deletedPost;
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
    deleteComment(parent, args, ctx, info) {
      const commentIndex = commentsData.findIndex(
        (comment) => comment.id === args.id
      );

      if (commentIndex === -1) throw new Error('Comment does not exist.');

      const deletedComment = commentsData.splice(commentIndex, 1)[0];

      return deletedComment;
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
  typeDefs: './src/schema.graphql',
  resolvers,
});

server.start(() => {
  console.log('The server is up and running.');
});

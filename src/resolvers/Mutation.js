import { v4 as uuidv4 } from 'uuid';

const Mutation = {
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
  updateUser(parent, args, { db }, info) {
    const { id, data } = args;
    const foundUser = db.usersData.find((user) => user.id === id);
    if (!foundUser) throw new Error('User not found.');

    if (typeof data.email === 'string') {
      const emailTaken = db.usersData.some((user) => user.email === data.email);
      if (emailTaken) throw new Error('Email taken.');
      foundUser.email = data.email;
    }

    if (typeof data.name === 'string') {
      foundUser.name = data.name;
    }

    if (typeof data.name !== 'undefined') {
      foundUser.age = data.age;
    }

    return foundUser;
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
  updatePost(parent, args, { db }, info) {
    const { id, data } = args;
    const foundPost = db.postsData.find((post) => post.id === id);
    if (!foundPost) throw new Error('Post not found.');

    if (typeof data.title === 'string') {
      foundPost.title = data.title;
    }

    if (typeof data.body === 'string') {
      foundPost.body = data.body;
    }

    if (typeof data.published === 'boolean') {
      foundPost.published = data.published;
    }

    return foundPost;
  },
  createComment(parent, args, { db, pubsub }, info) {
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
    pubsub.publish(`channel-${args.comment.post}`, {
      comment: newComment,
    });

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
  updateComment(parent, args, { db }, info) {
    const { id, data } = args;
    const foundComment = db.commentsData.find((comment) => comment.id === id);
    if (!foundComment) throw new Error('Comment not found.');

    if (typeof data.text === 'string') {
      foundComment.text = data.text;
    }

    return foundComment;
  },
};

export { Mutation as default };

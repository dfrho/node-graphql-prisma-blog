const Post = {
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
};

export { Post as default };

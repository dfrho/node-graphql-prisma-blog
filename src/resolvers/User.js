const User = {
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
};

export { User as default };

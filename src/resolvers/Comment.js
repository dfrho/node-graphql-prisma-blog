const Commment = {
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
};

export { Commment as default };

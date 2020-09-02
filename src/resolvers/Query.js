const Query = {
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
};

export { Query as default };

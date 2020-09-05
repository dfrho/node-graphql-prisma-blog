const Subscription = {
  comment: {
    subscribe(parents, { postID }, { db, pubsub }, info) {
      const foundPost = db.postsData.find(
        (post) => post.id === postID && post.published
      );
      if (!foundPost) {
        throw new Error('Post not found');
      }

      return pubsub.asyncIterator(`channel-${postID}`);
    },
  },
  post: {
    subscribe(parents, args, { pubsub }, info) {
      return pubsub.asyncIterator(`channel-posts`);
    },
  },
};

export { Subscription as default };

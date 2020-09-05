const Subscription = {
  count: {
    subscribe(parent, args, { pubsub }, info) {
      let count = 0;
      setInterval(() => {
        count++;
        pubsub.publish('count', {
          count,
        });
      }, 1000);
      return pubsub.asyncIterator('count');
    },
  },
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
};

export { Subscription as default };

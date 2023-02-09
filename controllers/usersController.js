const User = require("../models/UserModel");
const passport = require("passport");

exports.currentUser_get = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    async (err, payload, info) => {
      if (err) {
        return next(err);
      }
      if (!payload) {
        return res.status(500).json({ message: info.message });
      }
      const currentUser = await User.findById(payload.user._id)
        .populate("friends")
        .populate("receivedRequests")
        .populate("sentRequests");
      res.json({ user: currentUser });
    }
  )(req, res, next);
};

exports.user_get = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("friends")
      .populate("receivedRequests")
      .populate("sentRequests");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user });
  } catch (err) {
    return next(err);
  }
};

// Handle friend request
exports.friend_post = async (req, res, next) => {
  try {
    const userId = req.body.user;
    const { receiverId } = req.params;
    const [user, receiver] = await Promise.all([
      User.findById(userId),
      User.findById(receiverId),
    ]);

    if (receiver.receivedRequests.includes(userId)) {
      const userRequests = user.sentRequests.filter(
        (id) => JSON.stringify(id) !== JSON.stringify(receiver._id)
      );
      const receiverRequests = receiver.receivedRequests.filter(
        (id) => JSON.stringify(id) !== JSON.stringify(user._id)
      );
      await Promise.all([
        User.findByIdAndUpdate(receiverId, {
          receivedRequests: receiverRequests,
        }),
        User.findByIdAndUpdate(userId, { sentRequests: userRequests }),
      ]);
      return res.json({ message: "Request is canceled successfully." });
    }

    await Promise.all([
      User.findByIdAndUpdate(receiver._id, {
        receivedRequests: [...receiver.receivedRequests, user._id],
      }),
      User.findByIdAndUpdate(user._id, {
        sentRequests: [...user.sentRequests, receiver._id],
      }),
    ]);
    res.json({
      message: `Request sent to ${
        receiver.firstName + " " + receiver.lastName
      } successfully.`,
    });
  } catch (err) {
    return next(err);
  }
};

// Handle friend request response (accept/decline)
exports.friend_update = async (req, res, next) => {
  try {
    const { senderId } = req.params;
    const userId = req.body.user;
    const action = req.body.action;

    const [user, sender] = await Promise.all([
      User.findById(userId),
      User.findById(senderId),
    ]);

    const senderRequests = sender.sentRequests.filter(
      (id) => JSON.stringify(id) !== JSON.stringify(user._id)
    );
    const userRequests = user.receivedRequests.filter(
      (id) => JSON.stringify(id) !== JSON.stringify(sender._id)
    );

    await Promise.all([
      User.findByIdAndUpdate(userId, { receivedRequests: userRequests }),
      User.findByIdAndUpdate(senderId, { sentRequests: senderRequests }),
    ]);

    if (action === "decline") {
      return res.json({ message: "Request declined successfully." });
    }
    await Promise.all([
      User.findByIdAndUpdate(userId, { friends: [...user.friends, senderId] }),
      User.findByIdAndUpdate(senderId, {
        friends: [...sender.friends, userId],
      }),
    ]);
    return res.json({ message: "Request accepted successfully." });
  } catch (err) {
    return next(err);
  }
};

// Delete friend
exports.friend_delete = async (req, res, next) => {
  try {
    const { friendId, userId } = req.params;
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);
    const userFriends = user.friends.filter(
      (id) => JSON.stringify(id) !== JSON.stringify(friend._id)
    );
    const friendFriends = friend.friends.filter(
      (id) => JSON.stringify(id) !== JSON.stringify(user._id)
    );

    await Promise.all([
      User.findByIdAndUpdate(user._id, { friends: userFriends }),
      User.findByIdAndUpdate(friend._id, { friends: friendFriends }),
    ]);

    return res.json({ message: "Friend removed successfully." });
  } catch (err) {
    return next(err);
  }
};

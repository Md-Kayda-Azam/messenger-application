const io = require("socket.io")(9000, {
  cors: "*",
});

let activeUsers = [];

// init socket server
io.on("connection", (socket) => {
  console.log("client is connected");

  // set active user to socket
  socket.on("setActiveUser", (data) => {
    const checkActiveUser = activeUsers.some((d) => d._id === data._id);

    if (!checkActiveUser) {
      activeUsers.push({
        userId: data._id,
        socketId: socket.id,
        user: data,
      });
    }

    io.emit("getActiveUser", activeUsers);
  });

  // manage real time chat
  socket.on("realTimeMsgSend", (data) => {
    const checkActiveUser = activeUsers.find(
      (d) => d.userId == data.receiverId
    );

    if (checkActiveUser) {
      socket.to(checkActiveUser.socketId).emit("realTimeMsgGet", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("client is disconnected");

    // remove active user form socket
    activeUsers = activeUsers.filter((data) => data.socketId !== socket.id);
    io.emit("getActiveUser", activeUsers);
  });
});

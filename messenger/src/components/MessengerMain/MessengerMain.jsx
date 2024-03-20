import "./MessengerMain.scss";
import { IoIosCall } from "react-icons/io";
import { FaVideo } from "react-icons/fa";
import { MdInfo } from "react-icons/md";
import Gallery from "../../svgs/Gallery";
import Plus from "../../svgs/Plus";
import Sticker from "../../svgs/Sticker";
import Gif from "../../svgs/Gif";
import Smile from "../../svgs/Smile";
import ThumbsUp from "../../svgs/ThumbsUp";
import EmojiPicker from "emoji-picker-react";
import useDropdownPopupControl from "../../hooks/useDropdownPopupControl";
import Profile from "../../svgs/Profile";
import Bell from "../../svgs/Bell";
import Search from "../../svgs/Search";
import Collapsible from "react-collapsible";
import Users from "../Users/Users";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@chakra-ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  createChat,
  getUserToUserChat,
} from "../../features/chat/chatApiSlice";
import useAuthUser from "../../hooks/useAuthUser";
import { io } from "socket.io-client";
import {
  realTimeChatUpdate,
  setMessageEmpty,
} from "../../features/chat/chatSlice";
import useSound from "use-sound";
import messengerNotification from "../../assets/messenger.mp3";

const MessengerMain = () => {
  const [chat, setChat] = useState("");
  const [activeUser, setActiveUser] = useState([]);
  const [chatImage, setChatImage] = useState(null);
  const dispatch = useDispatch();
  const { chats, chatSuccess } = useSelector((state) => state.chat);

  const socket = useRef();

  const scrollChat = useRef();

  const [notification] = useSound(messengerNotification);

  const { user } = useAuthUser();

  const { isOpen, toggleMenu } = useDropdownPopupControl();
  const [activeChat, setActiveChat] = useState(false);

  const handleMessageSend = (e) => {
    if (e.key === "Enter") {
      const form_data = new FormData();

      form_data.append("chat", chat);
      form_data.append("receiverId", activeChat._id);
      form_data.append("chat-image", chatImage);

      dispatch(createChat(form_data));
      setChat("");
      setChatImage(null);
    }
  };

  useEffect(() => {
    if (chatSuccess) {
      socket.current.emit("realTimeMsgSend", chatSuccess);
    }

    dispatch(setMessageEmpty());
  }, [chatSuccess, dispatch]);

  useEffect(() => {
    if (
      chatSuccess &&
      chatSuccess.senderId !== activeUser._id &&
      chatSuccess.receiverId === user._id
    ) {
      notification();
    }
  }, [chatSuccess, activeUser?._id, notification, user?._id]);

  // handle change chat image
  const handleChatPhoto = (e) => {
    setChatImage(e.target.files[0]);
  };

  // handle emoji select
  const handleEmojiSelect = (emojiObject, event) => {
    setChat((prevState) => prevState + " " + emojiObject.emoji);
  };

  useEffect(() => {
    socket.current = io("ws://localhost:9000");

    // send login user as active
    socket.current.emit("setActiveUser", user);

    // get active users data
    socket.current.on("getActiveUser", (data) => {
      setActiveUser(data);
    });

    socket.current.on("realTimeMsgGet", (data) => {
      dispatch(realTimeChatUpdate(data));
    });
  }, []);

  useEffect(() => {
    dispatch(getUserToUserChat(activeChat._id));
  }, [activeChat, dispatch]);

  useEffect(() => {
    scrollChat.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <>
      <div className="chat-container">
        <Users
          setActiveChat={setActiveChat}
          activeChat={activeChat}
          scrollChat={scrollChat}
          activeUser={activeUser}
        />
        <div className="chat-body">
          {activeChat ? (
            <>
              <div className="chat-body-active-user">
                <div className="chat-active-user-details">
                  <Avatar name={activeChat.name} src={activeChat?.photo} />
                  <span className="chat-user-name">{activeChat?.name}</span>
                </div>
                <div className="chat-active-user-menu">
                  <button>
                    <IoIosCall />
                  </button>

                  <button>
                    <FaVideo />
                  </button>

                  <button>
                    <MdInfo />
                  </button>
                </div>
              </div>

              <div className="chat-body-msg">
                <div className="chat-msg-profile">
                  <Avatar name={activeChat?.name} src={activeChat?.photo} />
                  <span className="chat-user-name">{activeChat?.name}</span>
                </div>
                <div className="chat-msg-list">
                  {chats.length > 0
                    ? chats.map((item, index) => {
                        return (
                          <>
                            {item.senderId === user._id ? (
                              <div className="my-msg" ref={scrollChat}>
                                {item?.message?.text && (
                                  <div className="msg-txt">
                                    {item.message.text}
                                  </div>
                                )}

                                <div className="msg-photo">
                                  <img src={item?.message?.photo} alt="" />
                                </div>
                              </div>
                            ) : (
                              <div className="friend-msg" ref={scrollChat}>
                                <img src={activeChat.photo} alt="" />
                                <div className="friend-msg-details">
                                  {item?.message?.text && (
                                    <div className="msg-txt">
                                      {item.message.text}
                                    </div>
                                  )}
                                  {item?.message?.photo && (
                                    <div className="msg-photo">
                                      <img src={item?.message?.photo} alt="" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="msg-time">
                              <span>
                                {moment(item?.createdAt).startOf("").fromNow()}
                              </span>
                            </div>
                          </>
                        );
                      })
                    : ""}
                </div>
              </div>

              <div className="chat-body-form">
                <div className="chat-form-icons">
                  <ul>
                    <li>
                      <Plus />
                    </li>
                    <li>
                      <label>
                        <Gallery />
                        <input
                          id="chat-image"
                          type="file"
                          style={{ display: "none" }}
                          onChange={handleChatPhoto}
                        />
                      </label>
                    </li>
                    <li>
                      <Sticker />
                    </li>
                    <li>
                      <Gif />
                    </li>
                  </ul>
                </div>
                <div className="chat-form-input">
                  <input
                    type="text"
                    onChange={(e) => setChat(e.target.value)}
                    value={chat}
                    onKeyDown={handleMessageSend}
                  />

                  {isOpen && (
                    <div className="chat-emoji-picker">
                      <EmojiPicker
                        previewConfig={{ showPreview: false }}
                        skinTonesDisabled={true}
                        onEmojiClick={handleEmojiSelect}
                      />
                    </div>
                  )}
                  <button className="emoji-btn" onClick={toggleMenu}>
                    <Smile />
                  </button>
                </div>
                <div className="chat-emoji">
                  <ThumbsUp />
                </div>
              </div>
            </>
          ) : (
            "No chat selected"
          )}
        </div>
        {activeChat && (
          <div className="chat-profile">
            <div className="profile-info">
              <Avatar name={activeChat?.name} src={activeChat?.photo} />

              <ul>
                <li>
                  <button onClick={notification}>
                    <Profile />
                  </button>
                  <span>Profile</span>
                </li>
                <li>
                  <button>
                    <Bell />
                  </button>
                  <span>Mute</span>
                </li>
                <li>
                  <button>
                    <Search />
                  </button>
                  <span>Search</span>
                </li>
              </ul>

              <div className="profile-options">
                <Collapsible trigger="Chat Info">
                  <p>
                    This is the collapsible content. It can be any element or
                    React component you like.
                  </p>
                  <p>
                    It can even be another Collapsible component. Check out the
                    next section!
                  </p>
                </Collapsible>
                <Collapsible trigger="Customize Chat">
                  <p>
                    This is the collapsible content. It can be any element or
                    React component you like.
                  </p>
                  <p>
                    It can even be another Collapsible component. Check out the
                    next section!
                  </p>
                </Collapsible>
                <Collapsible trigger="Media, files and links">
                  <p>
                    This is the collapsible content. It can be any element or
                    React component you like.
                  </p>
                  <p>
                    It can even be another Collapsible component. Check out the
                    next section!
                  </p>
                </Collapsible>
                <Collapsible trigger="Privacy and support">
                  <p>
                    This is the collapsible content. It can be any element or
                    React component you like.
                  </p>
                  <p>
                    It can even be another Collapsible component. Check out the
                    next section!
                  </p>
                </Collapsible>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MessengerMain;

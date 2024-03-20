import { HiDotsHorizontal } from "react-icons/hi";
import { FiEdit } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { createToast } from "../../utils/toast";
import { setMessageEmpty } from "../../features/user/userSlice";
import { getAllUser } from "../../features/user/userApiSlice";
import { Avatar } from "@chakra-ui/avatar";
import moment from "moment";

const Users = ({ setActiveChat, activeChat, scrollChat, activeUser }) => {
  const dispatch = useDispatch();
  const { users, error, message } = useSelector((state) => state.user);

  const handleActiveChat = (item) => {
    setActiveChat(item);
  };

  useEffect(() => {
    dispatch(getAllUser());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      createToast(message, "success");
      dispatch(setMessageEmpty());
    }

    if (error) {
      createToast(error);
      dispatch(setMessageEmpty());
    }
  }, [message, error, dispatch]);

  return (
    <div className="chat-users">
      <div className="chat-users-header">
        <div className="chat-users-header-top">
          <h2>Chats</h2>
          <div className="btns">
            <button>
              <HiDotsHorizontal />
            </button>
            <button>
              <FiEdit />
            </button>
          </div>
        </div>
        <div className="chat-users-header-search">
          <input type="search" />
          <button>
            <FaSearch />
          </button>
        </div>
        <div className="chat-users-header-menu">
          <button className="active">Inbox</button>
          <button>Communities</button>
        </div>
      </div>
      <div className="chat-users-list">
        {users?.map((item, index) => {
          return (
            <div
              className={`user-item ${
                item.userInfo._id === activeChat?._id ? "active" : ""
              }`}
              key={index}
              onClick={() => handleActiveChat(item.userInfo)}
            >
              {activeUser.some((data) => data.userId === item.userInfo._id) && (
                <div className="user-status active"></div>
              )}

              <Avatar name={item.userInfo.name} src={item.userInfo.photo} />

              <div className="user-details">
                <span className="user-name">{item.userInfo.name}</span>
                <span className="user-chat-info">
                  <span className="chat-short">
                    {item?.lastMsg
                      ? item?.lastMsg?.message?.text.slice(0, 15)
                      : "connected"}
                  </span>
                  <span className="chat-time">
                    {item?.lastMsg?.createdAt &&
                      moment(item?.lastMsg?.createdAt).startOf("").fromNow()}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Users;

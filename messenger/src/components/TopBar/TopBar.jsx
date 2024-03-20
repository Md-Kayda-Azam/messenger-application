import { Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FaHome } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { CiVideoOn } from "react-icons/ci";
import { CiShop } from "react-icons/ci";
import { FaLock } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { CiLogout } from "react-icons/ci";
import { MdDarkMode } from "react-icons/md";
import "./TopBar.scss";
import useDropdownPopupControl from "../../hooks/useDropdownPopupControl";
import useAuthUser from "../../hooks/useAuthUser";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authApiSlice";
import { Avatar } from "@chakra-ui/avatar";

const TopBar = () => {
  const { isOpen, toggleMenu } = useDropdownPopupControl();
  const { user } = useAuthUser();
  const dispatch = useDispatch();

  // user logout
  const handleUserLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <>
      <div className="top-bar">
        <div className="topbar-container">
          <div className="topbar-search">
            <Link to="/">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png"
                alt=""
              />
            </Link>
            <div className="search">
              <input type="text" placeholder="Search Messenger" />

              <CiSearch />
            </div>
          </div>
          <div className="topbar-menu">
            <ul>
              <li>
                <Link to="/">
                  <FaHome />
                </Link>
              </li>
              <li>
                <Link to="/">
                  <FaUserFriends />
                </Link>
              </li>
              <li>
                <Link to="/">
                  <CiVideoOn />
                </Link>
              </li>
              <li>
                <Link to="/">
                  <CiShop />
                </Link>
              </li>
            </ul>
          </div>
          <div className="topbar-user">
            <button onClick={toggleMenu}>
              <Avatar
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#ccc",
                  borderRadius: "50%",
                }}
                name={user.name}
                src={user.photo}
              />
            </button>

            {isOpen && (
              <div className="drop-down-menu dropdown">
                <ul>
                  <li>
                    <Link to="/">
                      <MdDarkMode /> Dark Mode
                    </Link>
                  </li>
                  <li>
                    <Link to="/">
                      <FaLock /> Password Change
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile-edit">
                      <CgProfile /> Edit Profile
                    </Link>
                  </li>
                  <li>
                    <Link onClick={handleUserLogout}>
                      <CiLogout /> Logout
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;

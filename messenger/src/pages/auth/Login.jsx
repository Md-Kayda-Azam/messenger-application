import "./Auth.scss";
import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../../components/AuthHeader/AuthHeader";
import PageHeader from "../../components/PageHeader/PageHeader";
import { useEffect } from "react";
import { createToast } from "../../utils/toast";
import { getAuthData, setMessageEmpty } from "../../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import useFormFields from "../../hooks/useFormFields";
import { loginUser } from "../../features/auth/authApiSlice";

const Login = () => {
  const { message, error, user } = useSelector(getAuthData);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { input, resetForm, handleInputChange } = useFormFields({
    auth: "",
    password: "",
  });

  // user login
  const handleUserLogin = (e) => {
    e.preventDefault();

    dispatch(loginUser(input));
  };

  useEffect(() => {
    if (message) {
      createToast(message, "success");
      dispatch(setMessageEmpty());
      resetForm();
      navigate("/login");
    }

    if (error) {
      createToast(error);
      dispatch(setMessageEmpty());
    }

    if (user) {
      navigate("/");
    }
  }, [message, error, dispatch, navigate, resetForm, user]);

  return (
    <>
      <PageHeader title="Sign In Here" />
      <div className="auth-container">
        <div className="auth-wraper">
          <div className="auth-top">
            <AuthHeader
              title="Sign In Here"
              desc="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci  "
            />

            <div className="auth-form">
              <form onSubmit={handleUserLogin}>
                <input
                  type="text"
                  placeholder="Email or Phone number"
                  value={input.auth}
                  onChange={handleInputChange}
                  name="auth"
                />
                <input
                  type="text"
                  placeholder="Password"
                  value={input.password}
                  onChange={handleInputChange}
                  name="password"
                />
                <button className="bg-fb">Log In</button>
              </form>
              <Link to={"/forgot"}>Forgot your password</Link>
            </div>
          </div>
          <div className="auth-bottom">
            <Link to="/register">Create new account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

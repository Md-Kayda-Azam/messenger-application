import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../../components/AuthHeader/AuthHeader";
import PageHeader from "../../components/PageHeader/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import { getAuthData, setMessageEmpty } from "../../features/auth/authSlice";
import useFormFields from "../../hooks/useFormFields";
import { useEffect } from "react";
import { createToast } from "../../utils/toast";
import { resetPasswordAction } from "../../features/auth/authApiSlice";
import Cookie from "js-cookie";

const Reset = () => {
  // hooks
  const dispatch = useDispatch();
  const { message, error, loader } = useSelector(getAuthData);
  const navigate = useNavigate();
  const token = Cookie.get("verifyToken");

  // form field manage
  const { input, handleInputChange, resetForm } = useFormFields({
    newPassword: "",
    confPassword: "",
    otp: "",
  });

  // password reset
  const handlePasswordReset = (e) => {
    e.preventDefault();

    dispatch(resetPasswordAction({ token, input }));
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
  }, [message, error, dispatch, navigate, resetForm]);

  return (
    <>
      <PageHeader title="Reset your password" />
      <div className="auth-container">
        <div className="auth-wraper">
          <div className="auth-top">
            <AuthHeader
              title="Reset your password"
              desc="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci  "
            />

            <div className="auth-form">
              <form onSubmit={handlePasswordReset}>
                <input
                  type="text"
                  placeholder="New password"
                  value={input.newPassword}
                  name="newPassword"
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  placeholder="Confirm password"
                  value={input.confPassword}
                  name="confPassword"
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  placeholder="Password OTP"
                  value={input.otp}
                  name="otp"
                  onChange={handleInputChange}
                />

                <button type="submit" className="bg-fb-green">
                  Reset your password
                </button>
              </form>
            </div>
          </div>
          <div className="auth-bottom">
            <Link to="/login">Log In Now</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reset;

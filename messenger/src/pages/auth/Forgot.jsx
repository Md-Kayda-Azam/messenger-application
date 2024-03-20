import "./Auth.scss";
import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../../components/AuthHeader/AuthHeader";
import PageHeader from "../../components/PageHeader/PageHeader";
import useFormFields from "../../hooks/useFormFields";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { createToast } from "../../utils/toast";
import { getAuthData, setMessageEmpty } from "../../features/auth/authSlice";
import { resetPassword } from "../../features/auth/authApiSlice";

const Forgot = () => {
  // hooks
  const dispatch = useDispatch();
  const { message, error, loader } = useSelector(getAuthData);
  const navigate = useNavigate();

  // form field manage
  const { input, handleInputChange, resetForm } = useFormFields({
    auth: "",
  });

  // handle reset pass
  const handleResetPass = (e) => {
    e.preventDefault();

    dispatch(resetPassword(input));
  };

  useEffect(() => {
    if (message) {
      createToast(message, "success");
      dispatch(setMessageEmpty());
      resetForm();
      navigate("/reset-password");
    }

    if (error) {
      createToast(error);
      dispatch(setMessageEmpty());
    }
  }, [message, error, dispatch, navigate, resetForm]);

  return (
    <>
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
                <form onSubmit={handleResetPass}>
                  <input
                    type="text"
                    placeholder="Email or Phone number"
                    value={input.auth}
                    name="auth"
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
    </>
  );
};

export default Forgot;

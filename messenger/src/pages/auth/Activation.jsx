import { Link, useNavigate, useParams } from "react-router-dom";
import AuthHeader from "../../components/AuthHeader/AuthHeader";
import PageHeader from "../../components/PageHeader/PageHeader";
import Cookie from "js-cookie";
import { useEffect } from "react";
import useFormFields from "../../hooks/useFormFields";
import { useDispatch, useSelector } from "react-redux";
import {
  activateAccountByOTP,
  activateAccountByURL,
} from "../../features/auth/authApiSlice";
import { dotsToHyphens } from "../../../../helpers/helpers";
import { getAuthData, setMessageEmpty } from "../../features/auth/authSlice";
import { createToast } from "../../utils/toast";

const Activation = () => {
  const { message, error } = useSelector(getAuthData);
  const navigate = useNavigate();
  const token = Cookie.get("verifyToken");
  const dispatch = useDispatch();

  // get token form url
  const { tokenURL } = useParams();

  const { input, resetForm, handleInputChange } = useFormFields({
    otp: "",
  });

  // account activate
  const handleUserActivate = (e) => {
    e.preventDefault();

    dispatch(
      activateAccountByOTP({ token: dotsToHyphens(token), otp: input.otp })
    );
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (tokenURL) {
      dispatch(activateAccountByURL(tokenURL));
    }
  }, [tokenURL, dispatch]);

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
      <>
        <>
          <PageHeader title="Activate your account" />
          <div className="auth-container">
            <div className="auth-wraper">
              <div className="auth-top">
                <AuthHeader
                  title="Activate your account"
                  desc="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci  "
                />

                <div className="auth-form">
                  <form onSubmit={handleUserActivate}>
                    <input
                      type="text"
                      placeholder="Activation Code"
                      value={input.otp}
                      onChange={handleInputChange}
                      name="otp"
                    />

                    <button type="submit" className="bg-fb-green">
                      Activate Now
                    </button>
                  </form>
                  <a href="#">Resend OTP</a>
                  <a href="#">Resend Activation Link to a*******7@gmail.com</a>
                </div>
              </div>
              <div className="auth-bottom">
                <Link to="/login">Login</Link>
              </div>
            </div>
          </div>
        </>
      </>
    </>
  );
};

export default Activation;

import { useEffect } from "react";
import "./Activate.scss";
import { createToast } from "../../utils/toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useFormFields from "../../hooks/useFormFields";
import { getAuthData, setMessageEmpty } from "../../features/auth/authSlice";
import useAuthUser from "../../hooks/useAuthUser";
import {
  dotsToHyphens,
  hideEmailMiddle,
  hideMobileNumber,
} from "../../helpers/helpers";
import {
  activateAccountByOTP,
  resendActivation,
} from "../../features/auth/authApiSlice";
import Cookies from "js-cookie";

const Activate = () => {
  const { message, error } = useSelector(getAuthData);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useAuthUser();

  const token = Cookies.get("verifyToken");

  const { input, resetForm, handleInputChange } = useFormFields({
    otp: "",
  });

  // account activate
  const handleUserActivate = (e) => {
    e.preventDefault();

    dispatch(
      activateAccountByOTP({
        token: dotsToHyphens(token),
        otp: input.otp,
      })
    );
  };

  const handleResendActivation = (e, auth) => {
    e.preventDefault();

    dispatch(resendActivation(auth));
  };

  useEffect(() => {
    if (message) {
      createToast(message, "success");
      dispatch(setMessageEmpty());
      resetForm();
    }

    if (error) {
      createToast(error);
      dispatch(setMessageEmpty());
    }
  }, [message, error, dispatch, navigate, resetForm, user]);
  return (
    <>
      <div className="auth-container">
        <div className="auth-wraper" style={{ height: "300px" }}>
          <div className="auth-top">
            <div className="auth-form">
              <h2>Hello {user?.name}, Plz Activate your account first</h2>
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

              {user.phone && (
                <a
                  href="#"
                  onClick={(e) => handleResendActivation(e, user.phone)}
                >
                  Resend OTP to {hideMobileNumber(user.phone)}
                </a>
              )}
              {user.email && (
                <a
                  href="#"
                  onClick={(e) => handleResendActivation(e, user?.email)}
                >
                  Resend Activation Link to {hideEmailMiddle(user?.email)}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Activate;

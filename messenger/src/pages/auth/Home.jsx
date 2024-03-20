import "./Auth.scss";
import { Link } from "react-router-dom";
import AuthHeader from "../../components/AuthHeader/AuthHeader";
import PageHeader from "../../components/PageHeader/PageHeader";

const Home = () => {
  return (
    <>
      <PageHeader title="Welcome to messenger" />
      <div className="auth-container">
        <div className="auth-wraper">
          <div className="auth-top">
            <AuthHeader
              title="Welcome to messenger"
              desc="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci  "
            />
          </div>
          <div className="auth-bottom">
            <Link className="bg-fb" to="/login">
              Login with Facebook
            </Link>
            <Link to="/login">Login with Phone or email</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

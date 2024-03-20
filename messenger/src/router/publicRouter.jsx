import Activation from "../pages/auth/Activation";
import Forgot from "../pages/auth/Forgot";
import Home from "../pages/auth/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Reset from "../pages/auth/Reset";
import PublicGard from "./PublicGard";

// create public router
const publicRouter = [
  {
    element: <PublicGard />,
    children: [
      {
        path: "/auth",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/forgot",
        element: <Forgot />,
      },
      {
        path: "/reset-password",
        element: <Reset />,
      },
      {
        path: "/activation",
        element: <Activation />,
      },
      {
        path: "/activation/:tokenURL",
        element: <Activation />,
      },
    ],
  },
];

// export router
export default publicRouter;

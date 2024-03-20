import Activate from "../../components/Activate/Activate";
import MessengerMain from "../../components/MessengerMain/MessengerMain";
import TopBar from "../../components/TopBar/TopBar";
import useAuthUser from "../../hooks/useAuthUser";

const Messenger = () => {
  const { user } = useAuthUser();

  return (
    <>
      <TopBar />
      {user.accessToken ? <Activate /> : <MessengerMain />}
    </>
  );
};

export default Messenger;

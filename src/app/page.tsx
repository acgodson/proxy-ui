import type { NextPage } from "next";
import LoadingWrapper from "../components/LoadingWrapper";
import CrosschainRouterDashboard from "../components/CrosschainRouterDashboard";

const Home: NextPage = () => {
  return (
    <LoadingWrapper>
      <CrosschainRouterDashboard />
    </LoadingWrapper>
  );
};

export default Home;

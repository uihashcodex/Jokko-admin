import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Viewdetail from "../components/Viewdetail";
import Assets from "../components/Assets";
import Network from "../components/Network";
import Profile from "../components/Profile";
import Viewuser from "../components/Viewuser";
import Walletlist from "../components/Walletlist";
import TransectionHistory from "../components/TransectionHistory";
import AddressGeneration from "../components/AddressGeneration";
import Griddemo from "../components/Griddemo";
import { constant } from "../const";



const WalletRouts = () => {
  console.log(constant?.adminRoute, 'adminRoute');

  return (
    <Routes>
      <Route path={`/${constant?.adminRoute}/dashboard`} element={<Dashboard />} />
      <Route path={`/${constant?.adminRoute}/assets`} element={<Assets />} />
      <Route path={`/${constant?.adminRoute}/network`} element={<Network />} />
      <Route path={`/${constant?.adminRoute}/viewdetails`} element={<Viewdetail />} />
      <Route path={`/${constant?.adminRoute}/viewuser/:id`} element={<Viewuser />} />
      <Route path={`/${constant?.adminRoute}/wallet`} element={<Walletlist />} />
      <Route path={`/${constant?.adminRoute}/wallet/:id`} element={<Walletlist />} />
      <Route path={`/${constant?.adminRoute}/transaction`} element={<TransectionHistory />} />
      <Route path={`/${constant?.adminRoute}/transaction/:id`} element={<TransectionHistory />} />
      <Route path={`/${constant?.adminRoute}/addressgeneration`} element={<AddressGeneration />} />
      <Route path={`/${constant?.adminRoute}/profile`} element={<Profile />} />
      <Route path={`/${constant?.adminRoute}/griddemo`} element={<Griddemo />} />
    </Routes>
  );
};

export default WalletRouts;
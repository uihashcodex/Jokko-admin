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
import Webhook from "../components/webhooks"; 
import EmailTemplateManagement from "../components/EmailTemplateManagement"; 
import PushNotification from "../components/pushnotification";
import EmailTemplateManagementnew from "../components/EmailTemplateManagementnew"; 
import TrendingCurrency from "../components/TrendingCurrency";
import DefaultCurrency from "../components/DefaultCurrency";
import RoleManagement from "../components/RoleManagement";
import StaffManagement from "../components/staffManagement"
import { constant } from "../const";
import SupportPage from "../components/support";




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
      <Route path={`/wallet/:id`} element={<Walletlist />} />
      <Route path={`/${constant?.adminRoute}/transaction`} element={<TransectionHistory />} />
      <Route path={`/transaction/:id`} element={<TransectionHistory />} />
      <Route path={`/${constant?.adminRoute}/addressgeneration`} element={<AddressGeneration />} />
      <Route path={`/${constant?.adminRoute}/profile`} element={<Profile />} />
      <Route path={`/${constant?.adminRoute}/griddemo`} element={<Griddemo />} />
      <Route path={`/${constant?.adminRoute}/webhook`} element={<Webhook />} />
      <Route path={`/${constant?.adminRoute}/emailtemplate`} element={<EmailTemplateManagement />} />
      <Route path={`/${constant?.adminRoute}/pushnotification`} element={<PushNotification />} />
      <Route path={`/${constant?.adminRoute}/emailcontent`} element={<EmailTemplateManagementnew />} />
      <Route path={`/${constant?.adminRoute}/trendingcurrency`} element={<TrendingCurrency />} />
      <Route path={`/${constant?.adminRoute}/defaultcurrency`} element={<DefaultCurrency />} />
      <Route path={`/${constant?.adminRoute}/support`} element={<SupportPage />} />
      <Route path={`/${constant?.adminRoute}/rolemanagement`} element={<RoleManagement />} />
      <Route path={`/${constant?.adminRoute}/staffmanagement`} element={<StaffManagement />} />

    </Routes>
  );
};

export default WalletRouts;
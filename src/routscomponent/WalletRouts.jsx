import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import BuySellFiatAsset from "../pages/BuySellFiatAsset";
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
import EmailCampaign from "../components/EmailCampaign";
import TrendingCurrency from "../components/TrendingCurrency";
import DefaultCurrency from "../components/DefaultCurrency";
import RoleManagement from "../components/RoleManagement";
import StaffManagement from "../components/staffManagement"
import { constant } from "../const";
import SupportPage from "../components/support";
import CoinRabbitTrans from "../components/exchange/CoinRabbitTrans";
import OnramperHistory from "../components/exchange/onramper";


// import CoinRabbittranscations from "../components/exchange/CoinRabbittranscations";




const WalletRouts = () => {
  console.log(constant?.adminRoute, 'adminRoute');

  return (
    <Routes>
      <Route path={`/${constant?.adminRoute}/dashboard`} element={<Dashboard />} />
      <Route path={`/${constant?.adminRoute}/assets`} element={<Assets />} />
      <Route path={`/${constant?.adminRoute}/buy-sell-fiat-asset`} element={<BuySellFiatAsset />} />
      <Route path={`/${constant?.adminRoute}/network`} element={<Network />} />
      <Route path={`/${constant?.adminRoute}/viewdetails`} element={<Viewdetail />} />
      <Route path={`/${constant?.adminRoute}/viewuser/:id`} element={<Viewuser />} />
      <Route path={`/${constant?.adminRoute}/wallet`} element={<Walletlist />} />
      <Route path={`/wallet/:id`} element={<Walletlist />} />
      <Route path={`/${constant?.adminRoute}/transaction`} element={<TransectionHistory />} />
      <Route path={`/${constant?.adminRoute}/coin-rabbbit-history`} element={<CoinRabbitTrans />} />
      <Route path={`/coin-rabbbit-history/:id`} element={<CoinRabbitTrans />} />
      <Route path={`/${constant?.adminRoute}/onramper-history`} element={<OnramperHistory />} />
      <Route path={`/onramper-history/:id`} element={<OnramperHistory />} />

      <Route path={`/transaction/:id`} element={<TransectionHistory />} />
      <Route path={`/${constant?.adminRoute}/addressgeneration`} element={<AddressGeneration />} />
      <Route path={`/${constant?.adminRoute}/profile`} element={<Profile />} />
      <Route path={`/${constant?.adminRoute}/griddemo`} element={<Griddemo />} />
      <Route path={`/${constant?.adminRoute}/webhook`} element={<Webhook />} />
      <Route path={`/${constant?.adminRoute}/emailtemplate`} element={<EmailTemplateManagement />} />
      <Route path={`/${constant?.adminRoute}/pushnotification`} element={<PushNotification />} />
      <Route path={`/${constant?.adminRoute}/emailcontent`} element={<EmailTemplateManagementnew />} />
      <Route path={`/${constant?.adminRoute}/emailcampaign`} element={<EmailCampaign />} />
      <Route path={`/${constant?.adminRoute}/trendingcurrency`} element={<TrendingCurrency />} />
      <Route path={`/${constant?.adminRoute}/defaultcurrency`} element={<DefaultCurrency />} />
      <Route path={`/${constant?.adminRoute}/support`} element={<SupportPage />} />
      <Route path={`/${constant?.adminRoute}/rolemanagement`} element={<RoleManagement />} />
      <Route path={`/${constant?.adminRoute}/staffmanagement`} element={<StaffManagement />} />

    </Routes>
  );
};

export default WalletRouts;

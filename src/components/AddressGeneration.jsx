import { useState } from "react";
import {
  Card,
  Select,
  Button,
  message,
  Typography,
} from "antd";
import {
  KeyOutlined,
  CopyOutlined,
} from "@ant-design/icons";
// import QRCode from "react-qr-code";

const { Option } = Select;
const { Text } = Typography;

const NETWORKS = ["ERC20", "BEP20", "TRC20"];
const ASSETS = ["USDT", "BTC", "ETH"];

const AddressGeneration = () => {
  const [network, setNetwork] = useState(null);
  const [asset, setAsset] = useState(null);
  const [generatedAddress, setGeneratedAddress] = useState("");

  const generateAddress = () => {
    if (!network || !asset) {
      message.warning("Please select Network and Asset");
      return;
    }

    // Dummy crypto address generator
    const randomAddress =
      "0x" +
      Math.random().toString(16).substring(2, 42);

    setGeneratedAddress(randomAddress);
    message.success("Address Generated Successfully");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(generatedAddress);
    message.success("Address Copied");
  };

  return (
    <div className="p-6">
      <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6">
        <KeyOutlined />
        Address Generation
      </h2>

      {/* Generate Card */}
      <Card className="rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">

          <Select
            placeholder="Select Network"
            className="w-full md:w-1/3"
            onChange={setNetwork}
          >
            {NETWORKS.map((n) => (
              <Option key={n} value={n}>
                {n}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Select Asset"
            className="w-full md:w-1/3"
            onChange={setAsset}
          >
            {ASSETS.map((a) => (
              <Option key={a} value={a}>
                {a}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            className="w-full md:w-auto"
            onClick={generateAddress}
          >
            Generate Address
          </Button>

        </div>
      </Card>

      {/* Generated Address Section */}
      {generatedAddress && (
        <Card className="rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="flex-1">
              <Text strong>Generated Address:</Text>

              <div className="flex items-center gap-3 mt-2 bg-gray-100 p-3 rounded-lg">
                <span className="font-mono text-sm break-all">
                  {generatedAddress}
                </span>

                <CopyOutlined
                  onClick={copyAddress}
                  className="cursor-pointer text-lg"
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Send only {asset} ({network}) to this address.
                Sending other assets may result in permanent loss.
              </p>
            </div>

            {/* <div>
              <QRCode value={generatedAddress} size={150} />
            </div> */}

          </div>
        </Card>
      )}
    </div>
  );
};

export default AddressGeneration;

import { Tabs } from "antd";

const ReusableTabs = ({
  items,
  activeKey,
  onChange,
  className
}) => {
  return (
    <Tabs
      items={items}
      activeKey={activeKey}
      onChange={onChange}
      className={className}
    />
  );
};

export default ReusableTabs;

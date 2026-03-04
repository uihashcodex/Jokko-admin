import { Button } from "antd";
import theme from "../config/theme";
const ReButton = ({
  name,
  type = "default",
  onClick,
  htmlType = "button",
  loading = false,
  disabled = false,
  icon,
  block = false,
  className
}) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      className={className}
      style={{ backgroundColor: theme.button.backgroundColor,
        background:theme.sidebarSettings.activeBgColor,
        color:"#000"
       }}
      htmlType={htmlType}
      loading={loading}
      disabled={disabled}
      icon={icon}
      block={block}
    >
      {name}
    </Button>
  );
};

export default ReButton;

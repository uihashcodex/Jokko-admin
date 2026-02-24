import { Input } from "antd";
import Anticon from "../reuseable/Anticon";

const InputField = ({
  type = "text",
  size = "large",
  icon,             
  placeholder,
  ...rest
}) => {

  const prefixIcon = icon ? <Anticon name={icon} /> : null;

  if (type === "password") {
    return (
      <Input.Password
        size={size}
        prefix={prefixIcon}
        placeholder={placeholder}
        {...rest}
      />
    );
  }

  return (
    <Input
      size={size}
      prefix={prefixIcon}
      placeholder={placeholder}
      {...rest}
    />
  );
};

export default InputField;

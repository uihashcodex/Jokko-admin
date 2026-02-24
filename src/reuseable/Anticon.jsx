import * as Icons from "@ant-design/icons";

const Anticon = ({
  name,
  size = 18,
  color,
  className = "",
  style = {},
  ...rest
}) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in @ant-design/icons`);
    return null;
  }

  return (
    <IconComponent
      {...rest}
      className={className}
      style={{
        fontSize: size,
        color,
        ...style,
      }}
    />
  );
};

export default Anticon;

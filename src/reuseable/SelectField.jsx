import { Select } from "antd";
const SelectField = ({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  allowClear = true,
  mode,
  style,
  ...rest
}) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      mode={mode}
      style={{ width: "100%",height:"30px",...style }}
      {...rest}
    />
  )
}

export default SelectField
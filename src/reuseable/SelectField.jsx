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
      className="custom-select"

      options={options}
      popupClassName="custom-select-dropdown"   // 🔥 important

      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      mode={mode}
      style={{ width: "100%",height:"30px",background:"#5E5E5E33",color:"white",...style }}
      {...rest}
    />
  )
}

export default SelectField
import { Card } from "antd";

const ReusableCard = ({
  title,
  icon,
  extra,
  children,
  className = "",
}) => {
  return (
    <Card
      bordered={false}
      className={`rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      bodyStyle={{ padding: 24 }}
      style={{ backgroundColor: "#5E5E5E33",color:"white",flex:1 }}
    >
      {(title || icon || extra) && (
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            {title && (
              <h3 className="text-lg font-semibold tracking-wide">
                {title}
              </h3>
            )}
          </div>
          {extra && <div>{extra}</div>}
        </div>
      )}

      {children}
    </Card>
  );
};

export default ReusableCard;

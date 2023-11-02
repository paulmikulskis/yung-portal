import { BiMessageAltDetail } from "react-icons/bi";

interface CommsIconProps {
  className?: string;
}

function CommsIcon({ className }: CommsIconProps) {
  return (
    <div className={className}>
      <BiMessageAltDetail className="w-full h-full" />
    </div>
  );
}

export default CommsIcon;

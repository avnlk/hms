import { Steps } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import "./room-allotment-wizard.css";

const stepIndexFromPath = (pathname: string): number => {
  if (pathname.includes("/review")) {
    return 2;
  }
  if (pathname.includes("/select-room")) {
    return 1;
  }
  return 0;
};

const RoomAllotmentWizard = () => {
  const { pathname } = useLocation();
  const current = stepIndexFromPath(pathname);

  return (
    <div className="room-allotment-page">
      <div className="room-allotment-card room-allotment-wizard-card">
        <div className="room-allotment-header">
          <h3>Room Allotment</h3>
        </div>
        <Steps
          className="room-allotment-steps"
          current={current}
          items={[
            { title: "Select Student" },
            { title: "Select Room" },
            { title: "Review & Confirm" }
          ]}
        />
        <Outlet />
      </div>
    </div>
  );
};

export default RoomAllotmentWizard;

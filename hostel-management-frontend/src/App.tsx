import { ReactKeycloakProvider, useKeycloak } from "@react-keycloak/web";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Spin } from "antd";
import keycloak from "./keycloak";
import AppShell from "./components/AppShell";
import StudentAdminPage from "./pages/StudentAdminPage";
import HostelAdminTreePage from "./pages/HostelAdminTreePage";
import RoomAllotmentListPage from "./pages/RoomAllotmentListPage";
import RoomAllotmentWizard from "./pages/RoomAllotmentWizard";
import RoomAllotmentStep1StudentPage from "./pages/RoomAllotmentStep1StudentPage";
import RoomAllotmentStep2SelectRoomPage from "./pages/RoomAllotmentStep2SelectRoomPage";
import RoomAllotmentStep3ReviewPage from "./pages/RoomAllotmentStep3ReviewPage";
import CheckInPage from "./pages/CheckInPage";
import CheckOutPage from "./pages/CheckOutPage";
import PresentOccupancyPage from "./pages/PresentOccupancyPage";
import VacatedListPage from "./pages/VacatedListPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RoomAllotmentEditPage from "./pages/RoomAllotmentEditPage";

const FullPageSpinner = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f4f7fb"
    }}
  >
    <Spin size="large" />
  </div>
);

const ProtectedLayout = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <FullPageSpinner />;
  }

  if (!keycloak.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<ProtectedLayout />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/room-allotment" element={<RoomAllotmentListPage />} />
          <Route path="/room-allotment/new" element={<RoomAllotmentWizard />}>
            <Route index element={<RoomAllotmentStep1StudentPage />} />
            <Route path="select-room" element={<RoomAllotmentStep2SelectRoomPage />} />
            <Route path="review" element={<RoomAllotmentStep3ReviewPage />} />
          </Route>
          <Route
            path="/room-allotment/:id/edit"
            element={<RoomAllotmentEditPage />}
          />
          <Route
            path="/room-allotment/edit/:id"
            element={<RoomAllotmentEditPage />}
          />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/check-out" element={<CheckOutPage />} />
          <Route path="/administration/student" element={<StudentAdminPage />} />
          <Route path="/administration/hostel" element={<HostelAdminTreePage />} />
          <Route path="/reports/present-occupancy" element={<PresentOccupancyPage />} />
          <Route path="/reports/vacated-list" element={<VacatedListPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

const App = () => {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ onLoad: "check-sso", pkceMethod: "S256" }}
      LoadingComponent={<FullPageSpinner />}
    >
      <AppRoutes />
    </ReactKeycloakProvider>
  );
};

export default App;

import { createHashRouter } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Dashboard } from "./components/Dashboard";
import { CalibrationWizard } from "./components/CalibrationWizard";
import { MonitorDashboard } from "./components/MonitorDashboard";
import { HistorialPage } from "./components/HistorialPage";
import { ConfiguracionPage } from "./components/ConfiguracionPage";
import { LearningModePage } from "./components/LearningModePage";

export const router = createHashRouter([
  {
    path: "/",
    Component: AuthLayout,
    children: [
      { index: true, Component: Login },
      { path: "signup", Component: Signup },
    ],
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/calibration",
    Component: CalibrationWizard,
  },
  {
    path: "/monitor",
    Component: MonitorDashboard,
  },
  {
    path: "/historial",
    Component: HistorialPage,
  },
  {
    path: "/config",
    Component: ConfiguracionPage,
  },
  {
    path: "/learning-mode",
    Component: LearningModePage,
  },
]);

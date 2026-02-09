import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Channels from "./pages/Channels";
import Pipeline from "./pages/Pipeline";
import Queue from "./pages/Queue";
import Config from "./pages/Config";
import Logs from "./pages/Logs";
import Test from "./pages/Test";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="channels" element={<Channels />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="queue" element={<Queue />} />
        <Route path="config" element={<Config />} />
        <Route path="logs" element={<Logs />} />
        <Route path="test" element={<Test />} />
      </Route>
    </Routes>
  );
}

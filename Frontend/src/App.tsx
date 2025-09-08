import DashboardLayout from './components/DashboardLayout';
import AlertStream from './components/AlertStream';
import MaliciousAlertsPanel from './components/MaliciousAlertsPanel';

function App() {
  return (
    <DashboardLayout>
      <AlertStream />
      <MaliciousAlertsPanel />
    </DashboardLayout>
  );
}

export default App;

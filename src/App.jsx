// App.jsx
import React, { useState } from "react";
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  LogOut,
  UserPlus,
  CheckSquare,
  XSquare,
  Plus,
} from "lucide-react";

// ---------- Mock traffic prediction ----------
const predictTrafficVolume = (inputs) => {
  const baseVolume = 3000;
  let volume = baseVolume;

  if (inputs.weather === "Clear") volume += 500;
  else if (inputs.weather === "Rain") volume -= 300;
  else if (inputs.weather === "Snow") volume -= 800;

  if (inputs.holiday === "None") volume += 200;

  const hour = parseInt(inputs.hours || "0", 10);
  if (hour >= 7 && hour <= 9) volume += 1000;
  else if (hour >= 16 && hour <= 18) volume += 800;

  const temp = parseFloat(inputs.temp || "0");
  if (temp > 25) volume += 200;
  else if (temp < 10) volume -= 300;

  return Math.max(0, volume);
};

// ---------- Mock master data ----------
const initialRoutes = [
  { id: 1, name: "City A - City B", battaPerTrip: 500, salaryPerTrip: 700 },
  { id: 2, name: "City B - City C", battaPerTrip: 400, salaryPerTrip: 600 },
  { id: 3, name: "Local Shuttle", battaPerTrip: 200, salaryPerTrip: 300 },
];

// ---------- Main App ----------
const App = () => {
  const [currentUser, setCurrentUser] = useState(null); // {id, role, name, email}
  const [showRegister, setShowRegister] = useState(false);

  const [users, setUsers] = useState([
    {
      id: 1,
      role: "admin",
      name: "Admin",
      email: "admin@transport.com",
      password: "admin123",
    },
  ]);

  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [settlements, setSettlements] = useState([]);

  const [routes] = useState(initialRoutes);

  // ---------- Traffic inputs (top widget) ----------
  const [inputs, setInputs] = useState({
    holiday: "None",
    temp: "",
    rain: "",
    snow: "",
    weather: "Clear",
    month: "",
    day: "",
    year: "",
    hours: "",
    minutes: "",
    seconds: "",
  });
  const [prediction, setPrediction] = useState(null);

  const handleTrafficInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = (e) => {
    e.preventDefault();
    const volume = predictTrafficVolume(inputs);
    setPrediction(volume);
  };

  // ---------- Auth ----------
  const handleLogin = (email, password) => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      alert("Invalid credentials");
      return;
    }
    setCurrentUser(user);
  };

  const handleRegisterDriver = (driverData, password) => {
    const newUserId = users.length + 1;
    const newUser = {
      id: newUserId,
      role: "driver",
      name: driverData.name,
      email: driverData.email,
      password,
    };
    const newDriver = {
      id: drivers.length + 1,
      userId: newUserId,
      name: driverData.name,
      email: driverData.email,
      phone: driverData.phone,
      license: driverData.license,
      paymentMode: driverData.paymentMode, // BATTAONLY | SALARYONLY | BOTH
      approved: false,
      registeredDate: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [...prev, newUser]);
    setDrivers((prev) => [...prev, newDriver]);
    alert("Registration submitted. Wait for admin approval.");
    setShowRegister(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // ---------- Payment helper ----------
  const calculatePayment = (trip, driverOverride) => {
    const route = routes.find((r) => r.id === trip.routeId);
    const driver =
      driverOverride ||
      drivers.find((d) => d.id === trip.driverId) || { paymentMode: "BATTAONLY" };

    let batta = 0;
    let salary = 0;

    if (driver.paymentMode === "BATTAONLY") {
      batta = route?.battaPerTrip || 0;
    } else if (driver.paymentMode === "SALARYONLY") {
      salary = route?.salaryPerTrip || 0;
    } else {
      batta = route?.battaPerTrip || 0;
      salary = route?.salaryPerTrip || 0;
    }

    return { batta, salary, total: batta + salary };
  };

  // ---------- Render ----------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
        {/* Traffic widget */}
        <div className="w-full max-w-4xl mb-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Traffic Volume Estimation
                </h2>
                <p className="text-xs text-gray-500">
                  Predict traffic volume using simple rules.
                </p>
              </div>
            </div>
            <form onSubmit={handlePredict} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Holiday
                </label>
                <select
                  name="holiday"
                  value={inputs.holiday}
                  onChange={handleTrafficInputChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="None">None</option>
                  <option value="Christmas Day">Christmas Day</option>
                  <option value="New Years Day">New Year&apos;s Day</option>
                  <option value="Independence Day">Independence Day</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    name="temp"
                    value={inputs.temp}
                    onChange={handleTrafficInputChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="e.g., 28"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Weather
                  </label>
                  <select
                    name="weather"
                    value={inputs.weather}
                    onChange={handleTrafficInputChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="Clear">Clear</option>
                    <option value="Clouds">Clouds</option>
                    <option value="Rain">Rain</option>
                    <option value="Snow">Snow</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hour
                  </label>
                  <input
                    type="number"
                    name="hours"
                    min="0"
                    max="23"
                    value={inputs.hours}
                    onChange={handleTrafficInputChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="0–23"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    name="minutes"
                    min="0"
                    max="59"
                    value={inputs.minutes}
                    onChange={handleTrafficInputChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="0–59"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Seconds
                  </label>
                  <input
                    type="number"
                    name="seconds"
                    min="0"
                    max="59"
                    value={inputs.seconds}
                    onChange={handleTrafficInputChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="0–59"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Predict
              </button>
            </form>
            {prediction !== null && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xs font-medium text-gray-700">
                  Estimated Traffic Volume
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {prediction} vehicles
                </p>
              </div>
            )}
          </div>

          {/* Demo credentials card */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Demo Credentials
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Use these to log in as admin and approve drivers.
            </p>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-semibold">Admin Email:</span>{" "}
                admin@transport.com
              </p>
              <p>
                <span className="font-semibold">Password:</span> admin123
              </p>
            </div>
          </div>
        </div>

        {/* Login / Register */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
          {!showRegister ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchRegister={() => setShowRegister(true)}
            />
          ) : (
            <RegisterForm
              onRegister={handleRegisterDriver}
              onCancel={() => setShowRegister(false)}
            />
          )}
        </div>
      </div>
    );
  }

  if (currentUser.role === "admin") {
    return (
      <AdminDashboard
        currentUser={currentUser}
        drivers={drivers}
        setDrivers={setDrivers}
        trips={trips}
        setTrips={setTrips}
        settlements={settlements}
        setSettlements={setSettlements}
        routes={routes}
        calculatePayment={calculatePayment}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <DriverDashboard
      currentUser={currentUser}
      drivers={drivers}
      trips={trips}
      setTrips={setTrips}
      routes={routes}
      calculatePayment={calculatePayment}
      onLogout={handleLogout}
    />
  );
};

// ---------- Login / Register components ----------
const LoginForm = ({ onLogin, onSwitchRegister }) => {
  const [email, setEmail] = useState("admin@transport.com");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">
        Management System
      </h1>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Login as Admin or Driver
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>
      <button
        type="button"
        onClick={onSwitchRegister}
        className="mt-3 w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
      >
        Register as Driver
      </button>
    </>
  );
};

const RegisterForm = ({ onRegister, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    license: "",
    paymentMode: "BATTAONLY",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(
      {
        name: form.name,
        email: form.email,
        phone: form.phone,
        license: form.license,
        paymentMode: form.paymentMode,
      },
      form.password
    );
  };

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
        Driver Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            License Number
          </label>
          <input
            type="text"
            name="license"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={form.license}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Payment Mode
          </label>
          <select
            name="paymentMode"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={form.paymentMode}
            onChange={handleChange}
          >
            <option value="BATTAONLY">Batta Only (Daily)</option>
            <option value="SALARYONLY">Salary Only (Monthly)</option>
            <option value="BOTH">Both (Split)</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            Register
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-400 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-500 transition"
          >
            Back
          </button>
        </div>
      </form>
    </>
  );
};

// ---------- Admin Dashboard ----------
const AdminDashboard = ({
  currentUser,
  drivers,
  setDrivers,
  trips,
  setTrips,
  settlements,
  setSettlements,
  routes,
  calculatePayment,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementType, setSettlementType] = useState("weekly");

  const pendingDrivers = drivers.filter((d) => !d.approved);
  const approvedDrivers = drivers.filter((d) => d.approved);
  const unsettledTrips = trips.filter((t) => !t.settled);

  const approveDriver = (driverId) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, approved: true } : d))
    );
  };

  const rejectDriver = (driverId) => {
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
  };

  const calculateSettlementSummary = (type) => {
    const summary = {};
    unsettledTrips.forEach((trip) => {
      const driver = drivers.find((d) => d.id === trip.driverId);
      if (!driver) return;
      const payment = calculatePayment(trip, driver);
      if (!summary[driver.id]) {
        summary[driver.id] = {
          driverId: driver.id,
          driverName: driver.name,
          battaAmount: 0,
          salaryAmount: 0,
          totalAmount: 0,
        };
      }
      if (type === "weekly") summary[driver.id].battaAmount += payment.batta;
      else summary[driver.id].salaryAmount += payment.salary;

      summary[driver.id].totalAmount =
        summary[driver.id].battaAmount + summary[driver.id].salaryAmount;
    });
    return Object.values(summary);
  };

  const processSettlement = () => {
    const summary = calculateSettlementSummary(settlementType);
    if (!summary.length) {
      alert("No unsettled trips to settle.");
      return;
    }
    const newSettlement = {
      id: settlements.length + 1,
      type: settlementType,
      date: new Date().toISOString().split("T")[0],
      drivers: summary,
      tripCount: unsettledTrips.length,
    };
    setSettlements((prev) => [newSettlement, ...prev]);
    setTrips((prev) => prev.map((t) => ({ ...t, settled: true })));
    setShowSettlement(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {currentUser.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Pending Approvals"
            value={pendingDrivers.length}
            icon={UserPlus}
            color="orange"
          />
          <StatCard
            title="Active Drivers"
            value={approvedDrivers.length}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Pending Trips"
            value={unsettledTrips.length}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Settlements"
            value={settlements.length}
            icon={CheckCircle}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-4">
          <div className="flex border-b">
            <TabButton
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
            >
              Pending Approvals
            </TabButton>
            <TabButton
              active={activeTab === "drivers"}
              onClick={() => setActiveTab("drivers")}
            >
              Active Drivers
            </TabButton>
            <TabButton
              active={activeTab === "trips"}
              onClick={() => setActiveTab("trips")}
            >
              Trips
            </TabButton>
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            >
              History
            </TabButton>
          </div>

          <div className="p-4">
            {activeTab === "pending" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Pending Driver Approvals
                </h2>
                {pendingDrivers.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-10 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No pending approvals
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {pendingDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="bg-white rounded-lg border p-4 flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {driver.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div>
                              <p className="text-gray-500">Email</p>
                              <p className="font-medium">{driver.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Phone</p>
                              <p className="font-medium">{driver.phone}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">License</p>
                              <p className="font-medium">{driver.license}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Payment Mode</p>
                              <p className="font-medium">
                                {driver.paymentMode.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-3">
                          <button
                            onClick={() => approveDriver(driver.id)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded text-xs flex items-center gap-1 hover:bg-green-700"
                          >
                            <CheckSquare className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectDriver(driver.id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded text-xs flex items-center gap-1 hover:bg-red-700"
                          >
                            <XSquare className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "drivers" && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-800">
                  Active Drivers
                </h2>
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Phone
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          License
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Payment Mode
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {approvedDrivers.map((driver) => (
                        <tr key={driver.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {driver.name}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {driver.email}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {driver.phone}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {driver.license}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {driver.paymentMode.replace("_", " ")}
                          </td>
                        </tr>
                      ))}
                      {approvedDrivers.length === 0 && (
                        <tr>
                          <td
                            className="px-3 py-4 text-center text-gray-500"
                            colSpan={5}
                          >
                            No approved drivers yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "trips" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Active Trips
                  </h2>
                  <button
                    onClick={() => setShowSettlement(true)}
                    disabled={unsettledTrips.length === 0}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Process Settlement
                  </button>
                </div>

                {showSettlement && (
                  <div className="bg-white border rounded-lg p-4 mb-3 space-y-3">
                    <h3 className="text-sm font-semibold">Settlement Processing</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSettlementType("weekly")}
                        className={`flex-1 py-2 rounded text-xs font-medium ${
                          settlementType === "weekly"
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Weekly Batta
                      </button>
                      <button
                        onClick={() => setSettlementType("monthly")}
                        className={`flex-1 py-2 rounded text-xs font-medium ${
                          settlementType === "monthly"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Monthly Salary
                      </button>
                    </div>
                    <div className="space-y-1 text-xs">
                      {calculateSettlementSummary(settlementType).map(
                        (item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between p-2 bg-gray-50 rounded"
                          >
                            <span>{item.driverName}</span>
                            <span className="font-bold">
                              ₹{item.totalAmount}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={processSettlement}
                        className="flex-1 bg-green-600 text-white py-2 rounded text-xs hover:bg-green-700"
                      >
                        Confirm Settlement
                      </button>
                      <button
                        onClick={() => setShowSettlement(false)}
                        className="flex-1 bg-gray-400 text-white py-2 rounded text-xs hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Vehicle
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Driver
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Route
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Date
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">
                          Batta
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">
                          Salary
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {unsettledTrips.map((trip) => {
                        const driver = drivers.find(
                          (d) => d.id === trip.driverId
                        );
                        const route = routes.find((r) => r.id === trip.routeId);
                        const payment = calculatePayment(trip, driver);
                        return (
                          <tr key={trip.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-900">
                              {trip.vehicle}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {driver?.name}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {route?.name}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {trip.date}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-green-600">
                              ₹{payment.batta}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-blue-600">
                              ₹{payment.salary}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-gray-900">
                              ₹{payment.total}
                            </td>
                          </tr>
                        );
                      })}
                      {unsettledTrips.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-3 py-4 text-center text-gray-500"
                          >
                            No active trips
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-800">
                  Settlement History
                </h2>
                {settlements.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-10 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No settlements yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {settlements.map((settlement) => (
                      <div
                        key={settlement.id}
                        className="bg-white border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {settlement.type === "weekly"
                                ? "Weekly"
                                : "Monthly"}{" "}
                              Settlement
                            </h3>
                            <p className="text-xs text-gray-500">
                              {settlement.date} • {settlement.tripCount} trips
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Completed
                          </span>
                        </div>
                        <div className="text-xs space-y-1 border-t pt-2">
                          {settlement.drivers.map((driver, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <span>{driver.driverName}</span>
                              <span className="font-semibold">
                                ₹{driver.totalAmount}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Driver Dashboard ----------
const DriverDashboard = ({
  currentUser,
  drivers,
  trips,
  setTrips,
  routes,
  calculatePayment,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState("select");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const driver = drivers.find((d) => d.userId === currentUser.id);

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Driver profile not found</p>
          <button
            onClick={onLogout}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!driver.approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 text-center max-w-md">
          <Clock className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Pending Approval
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Your registration is pending admin approval. Please wait for
            confirmation.
          </p>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const myTrips = trips.filter((t) => t.driverId === driver.id);
  const unsettledTrips = myTrips.filter((t) => !t.settled);
  const settledTrips = myTrips.filter((t) => t.settled);

  const totalPending = unsettledTrips.reduce((sum, trip) => {
    const payment = calculatePayment(trip, driver);
    return sum + payment.total;
  }, 0);

  const totalSettled = settledTrips.reduce((sum, trip) => {
    const payment = calculatePayment(trip, driver);
    return sum + payment.total;
  }, 0);

  const handleTripSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoute || !selectedVehicle) return;
    const newTrip = {
      id: trips.length + 1,
      vehicle: selectedVehicle,
      routeId: parseInt(selectedRoute, 10),
      driverId: driver.id,
      date: new Date().toISOString().split("T")[0],
      settled: false,
    };
    setTrips((prev) => [...prev, newTrip]);
    setSelectedRoute("");
    setSelectedVehicle("");
    alert("Trip added successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Driver Dashboard
            </h1>
            <p className="text-gray-600">Welcome, {driver.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Pending Payment"
            value={`₹${totalPending}`}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Total Earned"
            value={`₹${totalSettled}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Total Trips"
            value={myTrips.length}
            icon={TrendingUp}
            color="blue"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-4">
          <div className="flex border-b">
            <TabButton
              active={activeTab === "select"}
              onClick={() => setActiveTab("select")}
            >
              Select Trip
            </TabButton>
            <TabButton
              active={activeTab === "mytrips"}
              onClick={() => setActiveTab("mytrips")}
            >
              My Trips
            </TabButton>
            <TabButton
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </TabButton>
          </div>

          <div className="p-4">
            {activeTab === "select" && (
              <div className="bg-white rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Select New Trip
                </h2>
                <form onSubmit={handleTripSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Select Route
                    </label>
                    <select
                      value={selectedRoute}
                      onChange={(e) => setSelectedRoute(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      required
                    >
                      <option value="">Choose a route</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name} - Batta ₹{route.battaPerTrip}, Salary ₹
                          {route.salaryPerTrip}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="e.g., AP39VD6284"
                      required
                    />
                  </div>
                  {selectedRoute && (
                    <div className="p-3 bg-blue-50 rounded-lg text-xs">
                      <p className="font-medium text-gray-700 mb-1">
                        Payment Breakdown
                      </p>
                      {driver.paymentMode === "BATTAONLY" && (
                        <p className="text-gray-600">
                          Batta: ₹
                          {
                            routes.find(
                              (r) => r.id === parseInt(selectedRoute, 10)
                            )?.battaPerTrip
                          }{" "}
                          (full amount as daily expense)
                        </p>
                      )}
                      {driver.paymentMode === "SALARYONLY" && (
                        <p className="text-gray-600">
                          Salary: ₹
                          {
                            routes.find(
                              (r) => r.id === parseInt(selectedRoute, 10)
                            )?.salaryPerTrip
                          }{" "}
                          (full amount as monthly)
                        </p>
                      )}
                      {driver.paymentMode === "BOTH" && (
                        <>
                          <p className="text-gray-600">
                            Batta: ₹
                            {
                              routes.find(
                                (r) => r.id === parseInt(selectedRoute, 10)
                              )?.battaPerTrip
                            }
                          </p>
                          <p className="text-gray-600">
                            Salary: ₹
                            {
                              routes.find(
                                (r) => r.id === parseInt(selectedRoute, 10)
                              )?.salaryPerTrip
                            }
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Trip
                  </button>
                </form>
              </div>
            )}

            {activeTab === "mytrips" && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-800">My Trips</h2>
                <div className="bg-white rounded-lg border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Vehicle
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Route
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          Date
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">
                          Batta
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">
                          Salary
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">
                          Total
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {myTrips.map((trip) => {
                        const route = routes.find(
                          (r) => r.id === trip.routeId
                        );
                        const payment = calculatePayment(trip, driver);
                        return (
                          <tr key={trip.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-900">
                              {trip.vehicle}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {route?.name}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {trip.date}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-green-600">
                              ₹{payment.batta}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-blue-600">
                              ₹{payment.salary}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-gray-900">
                              ₹{payment.total}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {trip.settled ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px]">
                                  Settled
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px]">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {myTrips.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-3 py-4 text-center text-gray-500"
                          >
                            No trips yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  My Profile
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <ProfileField label="Full Name" value={driver.name} />
                  <ProfileField label="Email" value={driver.email} />
                  <ProfileField label="Phone" value={driver.phone} />
                  <ProfileField label="License Number" value={driver.license} />
                  <ProfileField
                    label="Payment Mode"
                    value={driver.paymentMode.replace("_", " ")}
                  />
                  <ProfileField
                    label="Registration Date"
                    value={driver.registeredDate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Small UI helpers ----------
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-3 text-xs font-medium transition border-b-2 ${
      active
        ? "text-indigo-600 border-indigo-600"
        : "text-gray-500 border-transparent hover:text-gray-700"
    }`}
  >
    {children}
  </button>
);

const ProfileField = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

export default App;

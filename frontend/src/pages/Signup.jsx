import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/useAuth";
import { getDashboardPath } from "../utils/routes";
import { clearPendingInvite, getInvitePath, getPendingInvite } from "../utils/invite";

const roles = [
  "student",
  "trainer",
  "institution",
  "programme_manager",
  "monitoring_officer",
];

const needsInstitutionId = (role) => role === "trainer";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: roles[0],
    institutionName: ""
  });
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const res = await API.get("/auth/institutions");
        setInstitutions(res.data.data?.institutions || []);
      } catch {
        setInstitutions([]);
      }
    };

    loadInstitutions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === "role" && !needsInstitutionId(value) ? { institutionName: "" } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(needsInstitutionId(form.role) && form.institutionName.trim()
          ? { institutionName: form.institutionName.trim() }
          : {})
      };
      const res = await API.post("/auth/signup", payload);
      login(res.data.token, res.data.user);
      const pendingInvite = getPendingInvite();
      const isStudentInviteSignup = pendingInvite && res.data.user.role === "student";

      if (pendingInvite && !isStudentInviteSignup) {
        clearPendingInvite();
      }

      const nextPath = isStudentInviteSignup ? getInvitePath(pendingInvite) : getDashboardPath(res.data.user.role);

      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Sign Up</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.replace("_", " ")}
            </option>
          ))}
        </select>
        {needsInstitutionId(form.role) && (
          <select
            name="institutionName"
            value={form.institutionName}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
            required
          >
            <option value="">Select institution</option>
            {institutions.map((institution) => (
              <option key={institution._id} value={institution.name}>
                {institution.name}
              </option>
            ))}
          </select>
        )}
        {needsInstitutionId(form.role) && (
          <p className="mb-4 text-sm text-gray-500">
            Trainers should choose the institution they belong to.
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="mt-4 text-center">
          Already have an account? <a href="/login" className="text-purple-600 hover:underline">Login</a>
        </div>
      </form>
    </div>
  );
};

export default Signup;

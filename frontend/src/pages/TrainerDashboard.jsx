import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import Error from "../components/Error";
import {
  fetchBatches,
  createBatch,
  assignBatchStudents,
  fetchBatchStudents,
  fetchTrainerSessions,
  createSession,
  fetchSessionAttendance,
  generateInvite
} from "../services/apiMethods";
import { notifySuccess, notifyError } from "../utils/toast";

const getSessionId = (session) => session._id || session.id || session.sessionId;
const getBatchId = (session) => {
  if (!session.batchId) {
    return null;
  }

  return typeof session.batchId === "object" ? session.batchId._id || session.batchId.id : session.batchId;
};
const formatDate = (value) => {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};
const normalizeAttendanceRows = (data) => data.data?.students || data.students || data.attendance || [];

const copyToClipboard = async (value) => {
  if (!value) {
    return false;
  }

  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);
  return copied;
};

const TrainerDashboard = ({ view = "dashboard" }) => {
  const [sessions, setSessions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [form, setForm] = useState({
    batchId: "",
    title: "",
    date: "",
    startTime: "",
    endTime: ""
  });
  const [attendance, setAttendance] = useState({});
  const [inviteLinks, setInviteLinks] = useState({});
  const [selectedStudentBatchId, setSelectedStudentBatchId] = useState("");
  const [studentEmails, setStudentEmails] = useState("");
  const [assignedStudents, setAssignedStudents] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [sessionData, batchData] = await Promise.all([
        fetchTrainerSessions(),
        fetchBatches()
      ]);
      const nextBatches = batchData.batches || batchData;

      setSessions(sessionData.sessions || sessionData);
      setBatches(nextBatches);
      setSelectedStudentBatchId((currentBatchId) => currentBatchId || nextBatches[0]?._id || "");
      setForm((currentForm) => ({
        ...currentForm,
        batchId: currentForm.batchId || nextBatches[0]?._id || ""
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await createSession(form);
      notifySuccess("Session created!");
      setForm({
        batchId: batches[0]?._id || "",
        title: "",
        date: "",
        startTime: "",
        endTime: ""
      });
      loadDashboardData();
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to create session");
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    try {
      const data = await createBatch({ name: batchName.trim() });
      const createdBatch = data.data?.batch;

      notifySuccess("Batch created!");
      setBatchName("");
      setShowBatchForm(false);

      if (createdBatch) {
        setBatches((currentBatches) => [...currentBatches, createdBatch]);
        setForm((currentForm) => ({
          ...currentForm,
          batchId: currentForm.batchId || createdBatch._id
        }));
        setSelectedStudentBatchId((currentBatchId) => currentBatchId || createdBatch._id);
      }

      loadDashboardData();
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to create batch");
    }
  };

  const loadAssignedStudents = async (batchId) => {
    if (!batchId) {
      setAssignedStudents([]);
      return;
    }

    try {
      const data = await fetchBatchStudents(batchId);
      setAssignedStudents(data.data?.assignedStudents || []);
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to fetch assigned students");
    }
  };

  const handleAssignStudents = async (e) => {
    e.preventDefault();

    const emails = studentEmails
      .split(/[\n,]+/)
      .map((email) => email.trim())
      .filter(Boolean);

    if (!selectedStudentBatchId) {
      notifyError("Select a batch first");
      return;
    }

    if (!emails.length) {
      notifyError("Enter at least one student email");
      return;
    }

    try {
      const data = await assignBatchStudents(selectedStudentBatchId, emails);
      setAssignedStudents(data.data?.assignedStudents || []);
      setStudentEmails("");
      notifySuccess("Students assigned to batch!");
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to assign students");
    }
  };

  const handleViewAttendance = async (sessionId) => {
    if (!sessionId) {
      notifyError("Session id is missing");
      return;
    }

    try {
      const data = await fetchSessionAttendance(sessionId);
      setAttendance((prev) => ({ ...prev, [sessionId]: normalizeAttendanceRows(data) }));
    } catch {
      notifyError("Failed to fetch attendance");
    }
  };

  const handleGenerateInvite = async (sessionId, batchId) => {
    if (!sessionId) {
      notifyError("Session id is missing");
      return;
    }

    if (!batchId) {
      notifyError("Batch id is missing");
      return;
    }

    try {
      const data = await generateInvite(batchId);
      const nextInviteLink = data.data?.inviteLink || data.link || data.inviteLink || "";

      setInviteLinks((currentLinks) => ({
        ...currentLinks,
        [sessionId]: nextInviteLink
      }));
      const copied = await copyToClipboard(nextInviteLink);
      notifySuccess(copied ? "Invite link generated and copied!" : "Invite link generated!");
    } catch {
      notifyError("Failed to generate invite link");
    }
  };

  const handleCopyInvite = async (inviteLink) => {
    try {
      const copied = await copyToClipboard(inviteLink);

      if (!copied) {
        throw new Error("Copy failed");
      }

      notifySuccess("Invite link copied!");
    } catch {
      notifyError("Failed to copy invite link");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAssignedStudents(selectedStudentBatchId);
  }, [selectedStudentBatchId]);

  const recentSessions = sessions.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-purple-700">Trainer Workspace</p>
        <h1 className="mt-1 text-3xl font-bold">
          {view === "sessions" ? "Sessions" : "Trainer Dashboard"}
        </h1>
        <p className="mt-2 text-gray-500">
          {view === "sessions"
            ? "Create class sessions, review attendance, and generate batch invite links."
            : "Track your assigned batches and upcoming training activity."}
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Error message={error} />
      ) : (
        <div className="space-y-6">
          {view === "dashboard" && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded bg-white p-5 shadow-sm border-l-4 border-purple-500">
                  <p className="text-sm font-medium text-gray-500">Assigned Batches</p>
                  <p className="mt-2 text-3xl font-bold text-purple-700">{batches.length}</p>
                </div>
                <div className="rounded bg-white p-5 shadow-sm border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-gray-500">Sessions Created</p>
                  <p className="mt-2 text-3xl font-bold text-blue-700">{sessions.length}</p>
                </div>
                <div className="rounded bg-white p-5 shadow-sm border-l-4 border-green-500">
                  <p className="text-sm font-medium text-gray-500">Recent Sessions</p>
                  <p className="mt-2 text-3xl font-bold text-green-700">{recentSessions.length}</p>
                </div>
              </div>

              <section className="bg-white p-5 rounded shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">My Batches</h2>
                    <p className="text-sm text-gray-500">Create and manage batches assigned to you.</p>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => setShowBatchForm((v) => !v)}
                  >
                    {showBatchForm ? "Cancel" : "Create Batch"}
                  </button>
                </div>
                {showBatchForm && (
                  <form onSubmit={handleCreateBatch} className="mb-4 flex gap-3 flex-wrap">
                    <input
                      type="text"
                      name="batchName"
                      placeholder="Batch name"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      className="border p-2 rounded flex-1 min-w-48"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      disabled={!batchName.trim()}
                    >
                      Save Batch
                    </button>
                  </form>
                )}
                {batches.length ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {batches.map((batch) => (
                      <div key={batch._id || batch.id} className="rounded border border-purple-100 bg-purple-50 p-4">
                        <p className="font-semibold text-purple-900">{batch.name}</p>
                        <p className="mt-1 text-xs text-purple-700">{batch._id || batch.id}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No batches assigned yet. Create a batch to start adding sessions.</p>
                )}
              </section>

              <section className="bg-white p-5 rounded shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Assign Students to Batch</h2>
                  <p className="text-sm text-gray-500">
                    Only these student email IDs can use the invite link for the selected batch.
                  </p>
                </div>
                <form onSubmit={handleAssignStudents} className="grid gap-4 lg:grid-cols-3">
                  <select
                    value={selectedStudentBatchId}
                    onChange={(e) => setSelectedStudentBatchId(e.target.value)}
                    className="border p-2 rounded"
                    required
                  >
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id || batch.id} value={batch._id || batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={studentEmails}
                    onChange={(e) => setStudentEmails(e.target.value)}
                    placeholder="student1@example.com, student2@example.com"
                    className="min-h-24 border p-2 rounded lg:col-span-2"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    disabled={!batches.length}
                  >
                    Save Students
                  </button>
                </form>
                <div className="mt-4">
                  <h3 className="font-semibold">Assigned Student Emails</h3>
                  {assignedStudents.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {assignedStudents.map((student) => (
                        <span
                          key={student._id || student.email}
                          className="rounded border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-800"
                        >
                          {student.email}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-500">No students assigned to this batch yet.</p>
                  )}
                </div>
              </section>

              <section className="bg-white p-5 rounded shadow-sm">
                <h2 className="text-lg font-semibold">Recent Sessions</h2>
                {recentSessions.length ? (
                  <div className="mt-4 divide-y">
                    {recentSessions.map((session) => (
                      <div key={getSessionId(session)} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium">{session.name || session.title || "Untitled session"}</p>
                          <p className="text-sm text-gray-500">{formatDate(session.date)}</p>
                        </div>
                        <span className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-600">
                          {session.startTime} - {session.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-gray-500">No sessions created yet.</p>
                )}
              </section>
            </>
          )}

          {view === "sessions" && (
            <>
              <section className="bg-white p-5 rounded shadow-sm">
                <div className="mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Create Session</h2>
                    <p className="text-sm text-gray-500">Schedule a class for one of your batches.</p>
                  </div>
                </div>
                <form onSubmit={handleCreateSession} className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                  <select
                    name="batchId"
                    value={form.batchId}
                    onChange={handleFormChange}
                    className="border p-2 rounded xl:col-span-2"
                    required
                  >
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id || batch.id} value={batch._id || batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="title"
                    placeholder="Session Name"
                    value={form.title}
                    onChange={handleFormChange}
                    className="border p-2 rounded xl:col-span-2"
                    required
                  />
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    className="border p-2 rounded"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3 xl:col-span-2">
                    <input
                      type="time"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleFormChange}
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      type="time"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleFormChange}
                      className="border p-2 rounded"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    disabled={!batches.length}
                  >
                    Create Session
                  </button>
                </form>
                {!batches.length && (
                  <p className="mt-3 text-sm text-red-600">
                    Create a batch on the Dashboard tab before scheduling a session.
                  </p>
                )}
              </section>

              <section className="bg-white p-5 rounded shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Session List</h2>
                  <span className="rounded bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                    {sessions.length} total
                  </span>
                </div>
                <div className="space-y-4">
                  {sessions.length ? (
                    sessions.map((session, index) => {
                    const sessionId = getSessionId(session);
                    const batchId = getBatchId(session);
                    const sessionAttendance = attendance[sessionId];
                    const sessionInviteLink = inviteLinks[sessionId];

                      return (
                        <div key={sessionId || `trainer-session-${index}`} className="rounded border border-gray-200 p-4">
                          <div className="flex flex-wrap justify-between gap-3">
                            <div>
                              <p className="font-semibold">{session.name || session.title || "Untitled session"}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(session.date)} | {session.startTime} - {session.endTime}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                onClick={() => handleViewAttendance(sessionId)}
                                disabled={!sessionId}
                              >
                                View Attendance
                              </button>
                              <button
                                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                onClick={() => handleGenerateInvite(sessionId, batchId)}
                                disabled={!sessionId || !batchId}
                                title={batchId ? "" : "No batch ID"}
                              >
                                Generate Invite
                              </button>
                            </div>
                          </div>
                          {sessionAttendance && (
                            <div className="mt-4 rounded bg-gray-50 p-3">
                              <div className="font-semibold mb-2">Attendance</div>
                              <ul className="space-y-1">
                                {sessionAttendance.map((a, idx) => (
                                  <li key={a.studentId || a._id || `${sessionId}-attendance-${idx}`}>
                                    {a.studentName || a.name || a.email || "Student"} - {a.status || "not marked"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {sessionInviteLink && (
                            <div className="mt-3 text-sm text-green-700">
                              <div className="flex flex-wrap items-center gap-2">
                                <span>Invite Link:</span>
                                <a href={sessionInviteLink} className="underline" target="_blank" rel="noopener noreferrer">
                                  {sessionInviteLink}
                                </a>
                                <button
                                  type="button"
                                  className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                                  onClick={() => handleCopyInvite(sessionInviteLink)}
                                >
                                  Copy Link
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">No sessions created yet.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TrainerDashboard;

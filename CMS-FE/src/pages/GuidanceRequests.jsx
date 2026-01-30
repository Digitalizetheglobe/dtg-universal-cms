import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/api";
import { Loader2, RefreshCw, Search, X, Save } from "lucide-react";

const STATUS_OPTIONS = ["new", "in_progress", "contacted", "closed"];

const formatDateTime = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || "";
  }
};

const GuidanceRequests = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState("new");
  const [editNotes, setEditNotes] = useState("");

  const token = useMemo(() => localStorage.getItem("token"), []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (!token) {
        showMessage("error", "Authentication required. Please login.");
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/guidance`, {
        params: {
          limit: 100,
          search: search || undefined,
          status: status || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const nextItems = res.data?.data?.items || [];
      setItems(nextItems);
    } catch (error) {
      console.error("Error fetching guidance requests:", error);
      showMessage(
        "error",
        error.response?.data?.error || "Failed to fetch guidance requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetails = (item) => {
    setSelected(item);
    setEditStatus(item?.status || "new");
    setEditNotes(item?.adminNotes || "");
  };

  const closeDetails = () => {
    setSelected(null);
    setEditNotes("");
  };

  const saveDetails = async () => {
    if (!selected?._id) return;
    setSaving(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/guidance/${selected._id}`,
        { status: editStatus, adminNotes: editNotes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updated = res.data?.data;
      if (updated?._id) {
        setItems((prev) =>
          prev.map((x) => (x._id === updated._id ? updated : x))
        );
        setSelected(updated);
        showMessage("success", "Saved");
      } else {
        showMessage("error", "Save failed");
      }
    } catch (error) {
      console.error("Error updating guidance request:", error);
      showMessage(
        "error",
        error.response?.data?.error || "Failed to update guidance request"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Guidance Requests</h1>
          <p className="text-sm text-gray-500">
            View messages submitted from the website “Get Guidance” form.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Search</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name / email / phone / city / message"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            Apply filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-gray-600">No guidance requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold">City</th>
                  <th className="text-left px-4 py-3 font-semibold">Message</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((it) => (
                  <tr
                    key={it._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetails(it)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {it.name || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {it.email ? (
                        <a
                          href={`mailto:${it.email}`}
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {it.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {it.phone ? (
                        <a
                          href={`tel:${it.phone}`}
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {it.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {it.city || "-"}
                    </td>
                    <td className="px-4 py-3 max-w-[360px] truncate">
                      {it.question || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                        {it.status || "new"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(it.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {selected.name || "Guidance Request"}
                </h2>
                <p className="text-xs text-gray-500">
                  Submitted: {formatDateTime(selected.createdAt)}
                </p>
              </div>
              <button
                onClick={closeDetails}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-600">Email</div>
                  <div className="text-sm">
                    {selected.email ? (
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selected.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600">Phone</div>
                  <div className="text-sm">
                    {selected.phone ? (
                      <a
                        href={`tel:${selected.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selected.phone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600">City</div>
                  <div className="text-sm">{selected.city || "-"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600">Status</div>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600">User message</div>
                <div className="mt-1 p-3 border rounded-md bg-gray-50 text-sm whitespace-pre-wrap">
                  {selected.question || "(No message provided)"}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600">Admin notes</div>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Add internal notes (optional)"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={closeDetails}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  disabled={saving}
                >
                  Close
                </button>
                <button
                  onClick={saveDetails}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidanceRequests;


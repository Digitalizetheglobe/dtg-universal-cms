import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/api";

const AppliedStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError("");
      try {
        // GET all career applications
        const res = await axios.get(
          "https://api.harekrishnavidya.org/api/career/applicants"
        );

        // Some APIs wrap data, so try common shapes
        const data =
          res.data?.data ||
          res.data?.applications ||
          res.data ||
          [];

        // Ensure we always have an array
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load applied candidates. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl rounded-xl bg-white p-4 shadow-md sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Applied Candidates
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              List of candidates who have applied through the career form.
            </p>
          </div>
        </div>

        {loading && (
          <p className="py-10 text-center text-gray-600">Loading data...</p>
        )}

        {error && !loading && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            No applications found.
          </p>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Applied On
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    CV
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {applications.map((app, index) => {
                  const appliedDate =
                    app.createdAt || app.appliedAt || app.date || null;

                  const dateString = appliedDate
                    ? new Date(appliedDate).toLocaleDateString()
                    : "-";

                  const rawCvUrl =
                    app.pdfUrl || app.cvUrl || app.cv || app.resume || app.resumeUrl;

                  // If backend sends a relative path like "/uploads/...", prefix with API_BASE_URL
                  const cvUrl =
                    rawCvUrl && !rawCvUrl.startsWith("http")
                      ? `${API_BASE_URL}${rawCvUrl}`
                      : rawCvUrl;

                  return (
                    <tr key={app._id || app.id || index}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {app.name || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {app.email || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {app.phone || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {app.position || app.role || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {app.gender || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {dateString}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {cvUrl ? (
                          <a
                            href={cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View CV
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedStatus;



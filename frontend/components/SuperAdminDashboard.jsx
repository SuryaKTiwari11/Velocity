  import React, { useEffect, useState } from "react";
  import { superAdminApi } from "../src/front2backconnect/api";

  const PAGE_SIZE = 20;

  const Section = ({ title, data, loading, error, renderRow }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow">
            <thead>
              <tr>
                {data.length > 0 &&
                  Object.keys(data[0]).map((k) => (
                    <th
                      key={k}
                      className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-left font-medium"
                    >
                      {k}
                    </th>
                  ))}
                {renderRow && (
                  <th className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-left font-medium">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) =>
                renderRow ? (
                  renderRow(row, i)
                ) : (
                  <tr key={row.id || i} className="hover:bg-gray-50">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="border-b border-gray-200 px-4 py-2">
                        {String(v)}
                      </td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  export default function SuperAdminDashboard() {
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState({});
    const [error, setError] = useState({});

    useEffect(() => {
      fetchSection("companies", superAdminApi.getCompanies, setCompanies);
      fetchSection("users", superAdminApi.getUsers, setUsers);
      fetchSection("payments", superAdminApi.getPayments, setPayments);
      fetchSection("invites", superAdminApi.getInvites, setInvites);
      // eslint-disable-next-line
    }, []);

    function fetchSection(key, apiFn, setFn) {
      setLoading((l) => ({ ...l, [key]: true }));
      setError((e) => ({ ...e, [key]: null }));
      apiFn({ page: 1, limit: PAGE_SIZE })
        .then((res) => {
          setFn(
            res.data[key] ||
              res.data[
                Object.keys(res.data).find((k) => Array.isArray(res.data[k]))
              ] ||
              []
          );
          setLoading((l) => ({ ...l, [key]: false }));
        })
        .catch((err) => {
          setError((e) => ({ ...e, [key]: err.message || "Error" }));
          setLoading((l) => ({ ...l, [key]: false }));
        });
    }

    async function handleDeleteCompany(companyId) {
      if (!window.confirm("Delete this company? This cannot be undone.")) return;
      setLoading((l) => ({ ...l, companies: true }));
      setError((e) => ({ ...e, companies: null }));
      try {
        await superAdminApi.deleteCompany(companyId);
        setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      } catch (err) {
        setError((e) => ({
          ...e,
          companies: err.message || "Delete failed",
        }));
      } finally {
        setLoading((l) => ({ ...l, companies: false }));
      }
    }

    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-10">Super Admin Dashboard</h1>
        <Section
          title="Companies"
          data={companies}
          loading={loading.companies}
          error={error.companies}
          renderRow={(row, i) => (
            <tr key={row.id || i} className="hover:bg-gray-50">
              {Object.values(row).map((v, j) => (
                <td key={j} className="border-b border-gray-200 px-4 py-2">
                  {String(v)}
                </td>
              ))}
              <td className="border-b border-gray-200 px-4 py-2 whitespace-nowrap">
                <button
                  className="text-blue-600 hover:underline mr-3"
                  onClick={() => alert(JSON.stringify(row, null, 2))}
                >
                  View
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDeleteCompany(row.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          )}
        />
        <Section
          title="Users"
          data={users}
          loading={loading.users}
          error={error.users}
        />
        <Section
          title="Payments"
          data={payments}
          loading={loading.payments}
          error={error.payments}
        />
        <Section
          title="Invites"
          data={invites}
          loading={loading.invites}
          error={error.invites}
        />
      </div>
    );
  }

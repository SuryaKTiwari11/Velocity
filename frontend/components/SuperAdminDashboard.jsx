  import React, { useEffect, useState } from "react";
  import { superAdminApi } from "../src/front2backconnect/api";

  const PAGE_SIZE = 20;

  const Section = ({ title, data, loading, error, renderRow }) => (
    <div style={{ marginBottom: 32 }}>
      <h2>{title}</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <table border="1" cellPadding={6}>
          <thead>
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((k) => <th key={k}>{k}</th>)}
              {renderRow && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) =>
              renderRow ? (
                renderRow(row, i)
              ) : (
                <tr key={row.id || i}>
                  {Object.values(row).map((v, j) => (
                    <td key={j}>{String(v)}</td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
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

    // Super admin: delete company (call backend, refresh list)
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
      <div style={{ padding: 32 }}>
        <h1>Super Admin Dashboard</h1>
        <Section
          title="Companies"
          data={companies}
          loading={loading.companies}
          error={error.companies}
          renderRow={(row, i) => (
            <tr key={row.id || i}>
              {Object.values(row).map((v, j) => (
                <td key={j}>{String(v)}</td>
              ))}
              <td>
                <button
                  style={{ color: "blue" }}
                  onClick={() => alert(JSON.stringify(row, null, 2))}
                >
                  View
                </button>
                <button
                  style={{ color: "red", marginLeft: 8 }}
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

import React, { useState } from "react";
import { inviteApi } from "../src/front2backconnect/api";
import { toast } from "react-hot-toast";

const InviteUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ message: "", isError: false });
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();
    setStatus({ message: "", isError: false });
    setInviteLink("");
    setLoading(true);
    try {
      const res = await inviteApi.create(email);
      if (res.data.data?.inviteToken) {
        setInviteLink(`${window.location.origin}/invite-signup?inviteToken=${res.data.data.inviteToken}`);
      }
      if (res.data.success && res.data.data?.inviteToken) {
        setStatus({ message: "Invite created! You can copy and share the link below, or check the user's email.", isError: false });
        setEmail("");
        // Do NOT auto-close the modal; let user copy the link and close manually
      } else if (res.data.success && res.data.data) {
        setStatus({ message: "Invite created! You can copy and share the link below, or check the user's email.", isError: false });
        setEmail("");
        // Do NOT auto-close the modal; let user copy the link and close manually
      } else {
        setStatus({ message: res.data.message || "Failed to send invite.", isError: true });
      }
    } catch (err) {
      setStatus({ message: err.response?.data?.message || err.message || "Failed to send invite.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Invite New User</h2>
        <form onSubmit={handleInvite}>
          <input
            type="email"
            className="w-full border px-3 py-2 mb-3"
            placeholder="User's email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </form>
        {status.message && (
          <div className={`mt-3 ${status.isError ? "text-red-600" : "text-green-600"}`}>{status.message}</div>
        )}
        {inviteLink && (
          <div className="mt-6">
            <div className="text-base text-blue-700 mb-2 font-semibold">Manual Invite Link (copy & share):</div>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="text"
                className="flex-1 border px-3 py-2 text-base bg-gray-100 rounded"
                value={inviteLink}
                readOnly
                onFocus={e => e.target.select()}
                style={{ minWidth: '300px' }}
              />
              <button
                className="bg-blue-600 text-white px-3 py-2 rounded text-base font-semibold hover:bg-blue-700 transition"
                onClick={async () => {
                  await navigator.clipboard.writeText(inviteLink);
                  if (typeof toast === 'function') {
                    toast.success('Copied to clipboard!');
                  } else {
                    alert('Copied to clipboard!');
                  }
                }}
              >Copy Link</button>
            </div>
            <div className="text-xs text-gray-500 mt-1">You can copy and share this link directly, even if the email is not delivered.</div>
          </div>
        )}
        <button className="mt-4 text-gray-600 underline w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default InviteUserModal;

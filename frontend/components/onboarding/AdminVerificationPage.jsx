import React, { useState, useEffect } from 'react';
import { onboardingApi, s3DocumentApi } from '../../src/front2backconnect/api';

const AdminVerificationPage = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingVerifications();
    }, []);

    const fetchPendingVerifications = async () => {
        try {
            const response = await onboardingApi.getPendingVerifications();
            setPendingUsers(response.data.pendingUsers);
        } catch (error) {
            console.error('Error fetching pending verifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (userId, action, notes = '') => {
        try {
            await onboardingApi.verifyUser(userId, action, notes);
            alert(`User ${action}d successfully!`);
            fetchPendingVerifications(); // Refresh list
        } catch (error) {
            console.error('Error verifying user:', error);
            alert('Error processing verification');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading pending verifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">User Verification Queue</h1>
                
                {pendingUsers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="text-gray-400 text-4xl mb-4">✅</div>
                        <h2 className="text-xl font-semibold text-gray-600 mb-2">All caught up!</h2>
                        <p className="text-gray-500">No pending user verifications at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {pendingUsers.map((user) => (
                            <UserVerificationCard 
                                key={user.id} 
                                user={user} 
                                onVerify={handleVerification}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const UserVerificationCard = ({ user, onVerify }) => {
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);

    const handleDocDownload = async (doc) => {
        try {
            const res = await s3DocumentApi.getDownloadUrl(doc.id);
            const url = res.data.downloadUrl;
            if (doc.mimeType && doc.mimeType.startsWith('image/')) {
                window.open(url, '_blank');
            } else {
                const a = document.createElement('a');
                a.href = url;
                a.download = doc.originalName || doc.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (err) {
            alert('Failed to get download link.');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                        Submitted: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">Training:</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                            user.isTrainingVideoDone 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {user.isTrainingVideoDone ? '✅ Complete' : '❌ Incomplete'}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500">
                        Status: {user.onboardingStatus}
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="mb-4">
                <h4 className="font-medium mb-2">Submitted Documents ({user.S3Documents?.length || 0})</h4>
                {user.S3Documents && user.S3Documents.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {user.S3Documents.map((doc) => (
                            <div key={doc.id} className="bg-gray-50 p-2 rounded text-sm">
                                <div className="font-medium">{doc.title}</div>
                                <div className="text-gray-500">{doc.type}</div>
                                <div className="text-xs text-gray-400">
                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                </div>
                                <button
                                    className="mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                                    onClick={() => handleDocDownload(doc)}
                                >
                                    {doc.mimeType && doc.mimeType.startsWith('image/') ? 'Preview' : 'Download'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                )}
            </div>

            {/* Notes */}
            {showNotes && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes (optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows="3"
                        placeholder="Add notes about the verification decision..."
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                    {showNotes ? 'Hide Notes' : 'Add Notes'}
                </button>
                <button
                    onClick={() => onVerify(user.id, 'approve', notes)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    ✅ Approve
                </button>
                <button
                    onClick={() => onVerify(user.id, 'reject', notes)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    ❌ Reject
                </button>
            </div>

            {!user.isTrainingVideoDone && (
                <p className="text-sm text-red-600 mt-2">
                    ⚠️ User must complete training videos before approval
                </p>
            )}
        </div>
    );
};

export default AdminVerificationPage;

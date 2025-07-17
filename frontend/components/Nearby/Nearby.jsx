import useAuthStore from "../../src/store/authStore";
import React, { useEffect, useState, useCallback } from "react";
import { nearbyApi } from "../../src/front2backconnect/api";
function NearbyPeople() {
  const { user, latitude, longitude, companyId, setCoordinates } = useAuthStore();
  const userId = user?.id;
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoReady, setGeoReady] = useState(false);

  // Get location if missing
  useEffect(() => {
    if ((!latitude || !longitude) && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setGeoReady(true);
        },
        () => setGeoReady(true)
      );
    } else {
      setGeoReady(true);
    }
  }, [latitude, longitude, setCoordinates]);

  // Fetch and update location
  const fetchNearby = useCallback(async (updateLoc = false) => {
    // Accept only real coordinates (not null/undefined/0)
    if (
      !userId ||
      latitude == null || longitude == null ||
      latitude === 0 || longitude === 0 ||
      !companyId
    ) {
      setError("Location or companyId not ready yet. Try allowing location access and refreshing the page.");
      return;
    }
    // Debug log: see what is being sent
    console.log("Sending location update:", { userId, latitude, longitude, companyId });
    setLoading(true);
    setError("");
    try {
      if (updateLoc) await nearbyApi.updateLocation({ userId, latitude, longitude, companyId });
      const res = await nearbyApi.findNearby({ userId, latitude, longitude, companyId });
      setPeople(res.data.people || []);
    } catch (err) {
      setError("Failed to fetch nearby people");
    } finally {
      setLoading(false);
    }
  }, [userId, latitude, longitude, companyId]);

  useEffect(() => {
    if (geoReady && userId && latitude && longitude && companyId) {
      fetchNearby(true);
    }
  }, [geoReady, userId, latitude, longitude, companyId, fetchNearby]);

  const handleUpdateLocation = () => fetchNearby(true);

  return (
    <div className="mx-auto max-w-4xl p-12 bg-white rounded-3xl shadow-2xl mt-12 border-4 border-blue-200">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6 flex items-center gap-4">
        <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-2 text-2xl">Connect with Colleagues Nearby</span>
        <span className="inline-block text-4xl">🤝</span>
      </h1>
      <div className="mb-8 text-gray-700 text-lg flex flex-col gap-2">
        <div><span className="font-semibold">Your Location:</span> {latitude && longitude ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : <span className="text-red-500">Not set</span>}</div>
        <div><span className="font-semibold">Company ID:</span> {companyId || <span className="text-red-500">Not set</span>}</div>
      </div>
      <button
        onClick={handleUpdateLocation}
        disabled={loading}
        className={`w-full py-4 mb-8 rounded-2xl font-bold text-xl transition-colors ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} text-white flex items-center justify-center gap-3 shadow-lg`}
      >
        {loading ? <span className="animate-spin text-2xl">🔄</span> : <span className="text-2xl">📍</span>}
        {loading ? "Updating..." : "Update My Location"}
      </button>
      <div className="mb-10 text-center text-blue-700 text-xl font-semibold">Meet your colleagues in real life. Start a conversation, collaborate, and build professional relationships!</div>
      {error && <div className="text-red-500 mb-5 text-lg font-semibold">{error}</div>}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && (
          <li className="text-gray-400 flex items-center gap-3 text-xl">
            <span className="animate-spin">🔄</span> Loading nearby people...
          </li>
        )}
        {!loading && people.length === 0 && (
          <li className="text-gray-400 flex flex-col items-start gap-2 text-xl">
            <span className="text-3xl">🕵️‍♂️</span> <span>No nearby people found.</span>
            <span className="text-base text-gray-500">Try updating your location or ask a colleague to log in nearby.</span>
          </li>
        )}
        {people.map(person => (
          <li key={person.id} className="p-6 bg-blue-50 rounded-2xl shadow-md border-2 border-blue-200 flex flex-col items-start gap-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">👤</span>
              <span className="font-bold text-blue-900 text-xl">{person.name}</span>
            </div>
            <span className="text-base text-gray-700 font-medium">{person.email}</span>
            <div className="text-lg text-blue-600 font-semibold">{Math.round(person.dist)} meters away</div>
            <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition">Meet Now</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NearbyPeople;

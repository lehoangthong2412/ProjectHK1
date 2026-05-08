import React, { useEffect, useState } from "react";
import { api } from "./api";

export default function AppApiExample() {
  const [branches, setBranches] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [tracking, setTracking] = useState("TRK001");
  const [trackingData, setTrackingData] = useState(null);

  useEffect(() => {
    api.getBranches().then(setBranches).catch(console.error);
    api.getShipments().then(setShipments).catch(console.error);
  }, []);

  const handleTrack = async () => {
    try {
      const data = await api.trackShipment(tracking);
      setTrackingData(data);
    } catch (error) {
      alert("Tracking number not found");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>CourierXpress API Example</h1>

      <h2>Branches</h2>
      <ul>
        {branches.map((b) => (
          <li key={b.branch_id}>
            {b.branch_code} - {b.branch_name}
          </li>
        ))}
      </ul>

      <h2>Shipments</h2>
      <ul>
        {shipments.map((s) => (
          <li key={s.shipment_id}>
            {s.tracking_number} - {s.current_status}
          </li>
        ))}
      </ul>

      <h2>Tracking</h2>
      <input value={tracking} onChange={(e) => setTracking(e.target.value)} />
      <button onClick={handleTrack}>Track</button>

      {trackingData && (
        <div style={{ marginTop: 16 }}>
          <p>Tracking: {trackingData.tracking_number}</p>
          <p>Status: {trackingData.current_status}</p>
          <p>Sender: {trackingData.sender?.full_name}</p>
          <p>Receiver: {trackingData.receiver?.full_name}</p>
        </div>
      )}
    </div>
  );
}

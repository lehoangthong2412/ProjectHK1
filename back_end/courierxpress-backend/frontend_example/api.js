const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "API request failed");
  }

  return response.json();
}

export const api = {
  getDashboard: () => request("/dashboard"),
  getBranches: () => request("/branches"),
  getCustomers: (search = "") => request(`/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getShipmentTypes: () => request("/shipment-types"),
  getShipments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/shipments${query ? `?${query}` : ""}`);
  },
  createShipment: (payload) => request("/shipments", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  trackShipment: (tracking) => request(`/tracking/${tracking}`),
  updateShipmentStatus: (shipmentId, payload) => request(`/shipments/${shipmentId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  getBills: () => request("/bills"),
  getBillByTracking: (tracking) => request(`/bills/by-tracking/${tracking}`),
};

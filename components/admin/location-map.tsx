'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon path issue with webpack/Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const activeIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:linear-gradient(135deg,#22c55e,#16a34a);
    border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);
    display:flex;align-items:center;justify-content:center;
    color:white;font-size:14px;font-weight:900;
  ">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
})

interface VendorLocation {
  vendor_id: string
  lat: number
  lng: number
  accuracy: number | null
  heading: number | null
  is_active: boolean
  updated_at: string
  profiles?: { full_name: string; avatar_url: string | null }
}

function MapCenter({ locations }: { locations: VendorLocation[] }) {
  const map = useMap()
  useEffect(() => {
    if (locations.length === 0) return
    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 14)
    } else {
      const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng] as [number, number]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [locations, map])
  return null
}

export default function LocationMap({ locations }: { locations: VendorLocation[] }) {
  // Default center — Lagos, Nigeria
  const center: [number, number] = locations.length > 0
    ? [locations[0].lat, locations[0].lng]
    : [6.5244, 3.3792]

  return (
    <MapContainer
      center={center}
      zoom={locations.length === 0 ? 7 : 13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenter locations={locations} />
      {locations.map(loc => (
        <Marker
          key={loc.vendor_id}
          position={[loc.lat, loc.lng]}
          icon={loc.is_active ? activeIcon : icon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{loc.profiles?.full_name ?? 'Vendor'}</p>
              <p className="text-xs text-gray-500">
                {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
              </p>
              {loc.accuracy && (
                <p className="text-xs text-gray-500">Accuracy: ±{Math.round(loc.accuracy)}m</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Updated: {new Date(loc.updated_at).toLocaleTimeString('en-NG')}
              </p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                loc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {loc.is_active ? '🟢 Live' : '⚫ Offline'}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

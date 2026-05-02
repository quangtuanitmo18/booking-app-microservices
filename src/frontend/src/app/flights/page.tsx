"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

interface Flight {
  id: number
  flightNumber: string
  price: number
  flightStatus: number
  flightDate: string
  departureDate: string
  departureAirportId: number
  aircraftId: number
  arriveDate: string
  arriveAirportId: number
  durationMinutes: number
}

const STATUS_LABELS: Record<number, string> = {
  0: "Unknown",
  1: "Flying",
  2: "Delay",
  3: "Canceled",
  4: "Completed",
}

const STATUS_COLORS: Record<number, string> = {
  0: "bg-zinc-500",
  1: "bg-emerald-500",
  2: "bg-amber-500",
  3: "bg-red-500",
  4: "bg-blue-500",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    apiFetch<Flight[]>("/flights")
      .then(setFlights)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            ✈️ BookingApp
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/flights"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Flights
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Available Flights
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Browse and book your next flight
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && flights.length === 0 && (
          <div className="py-20 text-center text-zinc-500">
            No flights available at the moment.
          </div>
        )}

        {!loading && flights.length > 0 && (
          <div className="grid gap-4">
            {flights.map((flight) => (
              <Link
                key={flight.id}
                href={`/flights/${flight.id}`}
                className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  {/* Flight info */}
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {flight.flightNumber}
                      </div>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${STATUS_COLORS[flight.flightStatus] || "bg-zinc-500"}`}
                      >
                        {STATUS_LABELS[flight.flightStatus] || "Unknown"}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="text-center">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          Airport #{flight.departureAirportId}
                        </div>
                        <div className="text-xs">{formatDate(flight.departureDate)}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-zinc-400">
                          {formatDuration(flight.durationMinutes)}
                        </div>
                        <div className="h-px w-20 bg-zinc-300 dark:bg-zinc-700" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          Airport #{flight.arriveAirportId}
                        </div>
                        <div className="text-xs">{formatDate(flight.arriveDate)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      ${flight.price}
                    </div>
                    <div className="text-xs text-zinc-500">per person</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

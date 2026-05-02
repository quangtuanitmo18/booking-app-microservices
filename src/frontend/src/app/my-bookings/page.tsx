"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

interface Booking {
  id: number
  flightNumber: string
  flightDate: string
  departureAirportId: number
  arriveAirportId: number
  seatNumber: string
  price: number
  createdAt: string
  passengerName: string
  status?: string
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

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchBookings = () => {
    setLoading(true)
    apiFetch<Booking[]>("/bookings/me")
      .then((data) => {
        setBookings(data || [])
      })
      .catch((err) => {
        setError(err.message || "Failed to load bookings. Please try logging in again.")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return
    try {
      await apiFetch(`/bookings/${id}/cancel`, { method: "PUT" })
      fetchBookings()
    } catch (err: any) {
      alert("Failed to cancel booking: " + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            ✈️ BookingApp
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/flights" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
              Flights
            </Link>
            <Link href="/my-bookings" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              My Bookings
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-100">My Bookings</h1>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            <p className="mb-4">{error}</p>
            <Link href="/login" className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Go to Login
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No bookings found</h3>
            <p className="mt-2 text-sm text-zinc-500">You haven't booked any flights yet.</p>
            <Link href="/flights" className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Browse Flights
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Flight {booking.flightNumber}
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {booking.status === 'CANCELLED' ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Cancelled
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Confirmed
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-zinc-500">Passenger</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{booking.passengerName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">Seat</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{booking.seatNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">Price</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">${booking.price}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">Route</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      APT {booking.departureAirportId} → APT {booking.arriveAirportId}
                    </div>
                  </div>
                </div>
                
                {(!booking.status || booking.status === 'CONFIRMED') && (
                  <div className="mt-6 flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

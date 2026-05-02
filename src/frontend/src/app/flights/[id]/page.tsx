"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

// Adapting to common seat representations, 
// if it's just strings we'll map it, if objects we use seatNumber
interface Seat {
  id?: number;
  seatNumber: string;
  seatClass?: string;
  isReserved?: boolean;
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

export default function FlightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  const [flight, setFlight] = useState<Flight | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)
  const [error, setError] = useState("")
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiFetch<Flight>(`/flights/${id}`),
      apiFetch<any[]>(`/flights/${id}/seats`)
    ])
      .then(([flightData, seatsData]) => {
        setFlight(flightData)
        // Normalize seats data depending on backend response shape
        const normalizedSeats = seatsData.map(s => 
          typeof s === 'string' ? { seatNumber: s } : s
        )
        setSeats(normalizedSeats)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleReserve = async () => {
    if (!selectedSeat || !flight) return

    setReserving(true)
    setError("")
    
    try {
      // 1. Fetch current passenger info
      const passengerInfo = await apiFetch<any>("/passengers/me")
      if (!passengerInfo || !passengerInfo.id) {
        throw new Error("Could not retrieve passenger profile. Are you logged in?")
      }

      // 2. Create the booking
      await apiFetch("/bookings/create", {
        method: "POST",
        body: JSON.stringify({
          passengerId: passengerInfo.id,
          flightId: flight.id,
          description: `Booking for seat ${selectedSeat}`,
        }),
      })
      
      alert(`Booking created successfully!`)
      router.push("/flights")
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again or login.")
    } finally {
      setReserving(false)
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
            <Link href="/flights" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Flights
            </Link>
            <Link href="/login" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/flights" className="mb-6 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Back to flights
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && flight && (
          <div className="grid gap-8 md:grid-cols-[1fr_300px]">
            <div className="space-y-8">
              {/* Flight Details Card */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Flight {flight.flightNumber}
                  </h1>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium text-white ${STATUS_COLORS[flight.flightStatus] || "bg-zinc-500"}`}>
                    {STATUS_LABELS[flight.flightStatus] || "Unknown"}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">APT {flight.departureAirportId}</div>
                    <div className="mt-1 text-sm text-zinc-500">{formatDate(flight.departureDate)}</div>
                  </div>
                  
                  <div className="flex flex-col items-center px-4">
                    <div className="text-sm font-medium text-zinc-400">{formatDuration(flight.durationMinutes)}</div>
                    <div className="my-2 h-px w-32 bg-zinc-300 dark:bg-zinc-700 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-400 text-lg">✈</div>
                    </div>
                    <div className="text-xs text-zinc-500">Direct</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">APT {flight.arriveAirportId}</div>
                    <div className="mt-1 text-sm text-zinc-500">{formatDate(flight.arriveDate)}</div>
                  </div>
                </div>
              </div>

              {/* Seat Selection Map (Simplified) */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Select your seat</h2>
                <p className="mt-1 text-sm text-zinc-500">Choose from the available seats below.</p>
                
                {seats.length === 0 ? (
                  <div className="mt-8 rounded-lg bg-zinc-50 p-6 text-center text-zinc-500 dark:bg-zinc-800/50">
                    No seats available for this flight.
                  </div>
                ) : (
                  <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
                    {seats.map((seat, idx) => (
                      <button
                        key={seat.id || seat.seatNumber || idx}
                        onClick={() => setSelectedSeat(seat.seatNumber)}
                        disabled={seat.isReserved}
                        className={`
                          flex h-12 flex-col items-center justify-center rounded-lg border-2 text-sm font-medium transition-all
                          ${seat.isReserved 
                            ? 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600' 
                            : selectedSeat === seat.seatNumber
                              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-500'
                          }
                        `}
                      >
                        {seat.seatNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            <div className="h-fit rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Booking Summary</h3>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Base Fare</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">${flight.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Seat Selection</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedSeat ? selectedSeat : "Not selected"}
                  </span>
                </div>
                
                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <div className="flex justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Total</span>
                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">${flight.price}</span>
                  </div>
                </div>

                <button
                  onClick={handleReserve}
                  disabled={!selectedSeat || reserving}
                  className="mt-6 w-full rounded-lg bg-zinc-900 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {reserving ? "Processing..." : selectedSeat ? "Reserve Seat" : "Select a seat to continue"}
                </button>
                
                <p className="mt-4 text-center text-xs text-zinc-500">
                  You must be logged in to reserve a seat.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

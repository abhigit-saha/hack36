'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Menu, X, Mic, SendHorizonal } from "lucide-react"

export default function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSymptomInput, setShowSymptomInput] = useState(false)
  const [symptoms, setSymptoms] = useState("")
  const [listening, setListening] = useState(false)
  const router = useRouter()

  const handleMic = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      setSymptoms(prev => prev + " " + speechResult)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
    }

    recognition.onend = () => {
      setListening(false)
    }

    setListening(true)
    recognition.start()
  }

  const handleSubmit = async () => {
    if (!symptoms.trim()) return alert("Please enter symptoms.")

    try {
      const res = await fetch("http://localhost:4000/doctor/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: symptoms }) 
      })

      const data = await res.json()
      const specialist = data.recommendation

      if (!specialist) return alert("No specialist found.")

      router.push(`/doctors?specialization=${encodeURIComponent(specialist)}`)
      setSymptoms("")
      setShowSymptomInput(false)
    } catch (err) {
      console.error("Failed to get specialist suggestion", err)
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">CareConnect</h1>

        <div className="hidden md:flex space-x-6 text-gray-700 font-medium items-center">
          <Link href="/">Home</Link>
          <Link href="/appointments">Appointments</Link>
          <Link href="/doctors">Doctors</Link>
          <Link href="/physio">Physio</Link>
          <Link href="/reports">Reports</Link>
          <Link href="/profile">Profile</Link>
          <button
            onClick={() => setShowSymptomInput(!showSymptomInput)}
            className="bg-gradient-to-r from-[#2AF598] to-[#009EFD] text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition"
          >
            Tell Symptoms
          </button>
        </div>

        <button
          className="md:hidden focus:outline-none z-50"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="flex flex-col px-6 py-10 space-y-6 text-gray-700 font-medium">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/appointments" onClick={() => setMenuOpen(false)}>Appointments</Link>
          <Link href="/doctors" onClick={() => setMenuOpen(false)}>Doctors</Link>
          <Link href="/physio" onClick={() => setMenuOpen(false)}>Physio</Link>
          <Link href="/reports" onClick={() => setMenuOpen(false)}>Reports</Link>
          <Link href="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
        </div>
      </div>

      {showSymptomInput && (
        <div className="bg-gray-100 p-4 border-t border-gray-300">
          <textarea
            className="w-full p-3 rounded-lg border shadow-inner"
            placeholder="Describe your symptoms here..."
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <div className="flex justify-end items-center space-x-4 mt-2">
            <button
              onClick={handleMic}
              className={`p-2 rounded-full ${listening ? "bg-red-400" : "bg-blue-500"} text-white shadow-md hover:scale-110 transition`}
              title="Speak"
            >
              <Mic />
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700"
            >
              <SendHorizonal className="inline-block mr-1" size={16} /> Submit
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

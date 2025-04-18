"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { MailCheck } from "lucide-react"

export default function ResendOtp() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleResend = async () => {
    try {
      const response = await fetch("http://localhost:4000/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage("OTP resent successfully. Please check your email.")
        window.location.href = `/verify-otp?email=${email}`
        setError("")
      } else {
        setError(data.message || "Failed to resend OTP.")
        setMessage("")
      }
    } catch (err) {
      console.error("Resend OTP error:", err)
      setError("An error occurred. Please try again later.")
      setMessage("")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MailCheck className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Resend OTP</CardTitle>
          <CardDescription>Enter your email to receive a new OTP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {message && <div className="text-green-500 text-sm text-center">{message}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <Button className="w-full" onClick={handleResend}>
            Resend OTP
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

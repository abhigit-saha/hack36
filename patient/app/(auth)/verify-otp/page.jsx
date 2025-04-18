"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { ShieldCheck } from "lucide-react"

export default function VerifyOtp() {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const handleVerify = async () => {
    try {
      const response = await fetch("http://localhost:4000/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ otp, email })
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess("OTP verified successfully!")
        setError("")
        setTimeout(() => {
          window.location.href = "/login"
        }, 1000)
      } else {
        setSuccess("")
        setError(data.message || "Invalid OTP. Please try again.")
      }
    } catch (err) {
      console.error("OTP verification error:", err)
      setError("An error occurred. Please try again later.")
    }
  }

  const handleResend = () => {
    if (email) {
      window.location.href = `/resend-otp?email=${email}`
    } else {
      setError("Email missing in URL. Cannot resend OTP.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Verify OTP</CardTitle>
          <CardDescription>Enter the OTP sent to your email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-500 text-sm text-center">{success}</div>}
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
          </div>
          <Button className="w-full" onClick={handleVerify}>
            Verify OTP
          </Button>
          <Button variant="outline" className="w-full" onClick={handleResend}>
            Resend OTP
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { Heart, Leaf } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { setUser } from "../../../redux/authSlice";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:4000/doctor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(setUser({ ...data.doctor }))
        window.location.href = "/"
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1D2A] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F67280] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#96E6B3] opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      {/* Cherry blossom petals floating (subtle decoration) */}
      <div className="absolute top-20 left-1/4 w-1 h-1 bg-[#F67280] opacity-20 rounded-full blur-sm"></div>
      <div className="absolute top-40 left-1/3 w-2 h-2 bg-[#F67280] opacity-15 rounded-full blur-sm"></div>
      <div className="absolute bottom-40 right-1/4 w-1 h-1 bg-[#F67280] opacity-20 rounded-full blur-sm"></div>
      <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-[#F67280] opacity-15 rounded-full blur-sm"></div>

      <Card className="w-full max-w-md bg-[#22253A]/80 backdrop-blur-sm border-[#333853] shadow-2xl relative overflow-hidden">
        {/* Card decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#96E6B3] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#F67280] opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <CardHeader className="text-center space-y-3 relative">
          <div className="flex justify-center">
            <div className="p-0.5 bg-gradient-to-r from-[#F67280] to-[#96E6B3] rounded-full">
              <div className="bg-[#22253A] p-3 rounded-full">
                <Heart className="h-8 w-8 text-transparent fill-[#F67280]" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#F67280] to-[#96E6B3] bg-clip-text text-transparent">
            Welcome to CareConnect
          </CardTitle>
          <CardDescription className="text-[#B8BCCF]">
            Sign in to provide healing and care
          </CardDescription>

          {/* Decorative wave line */}
          <div className="flex justify-center pt-1">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#F67280]/30 to-transparent rounded-full"></div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 relative">
          {error && (
            <div className="text-[#F67280] text-sm text-center bg-[#F67280]/10 py-2 px-3 rounded-lg border border-[#F67280]/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#B8BCCF] text-sm font-medium">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#2A2E45] border-[#333853] text-[#E2E4EE] focus-visible:ring-[#96E6B3]/30 focus-visible:border-[#96E6B3]/50 placeholder:text-[#686E8A] rounded-xl py-5 pl-4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#B8BCCF] text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#2A2E45] border-[#333853] text-[#E2E4EE] focus-visible:ring-[#96E6B3]/30 focus-visible:border-[#96E6B3]/50 placeholder:text-[#686E8A] rounded-xl py-5 pl-4"
              />
            </div>
          </div>

          <Button
            className="w-full mt-4 bg-gradient-to-r from-[#F67280] to-[#F8B195] hover:from-[#F8B195] hover:to-[#F67280] border-none text-white font-medium py-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#F67280]/10 hover:shadow-[#F67280]/20"
            onClick={handleSubmit}
          >
            Sign In
          </Button>

          <div className="flex items-center justify-center pt-1">
            <Leaf className="h-3 w-3 text-[#96E6B3]/40 mr-2" />
            <p className="text-xs text-[#686E8A]">Healing through technology and compassion</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
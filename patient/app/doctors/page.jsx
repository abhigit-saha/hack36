'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Input } from '../../components/ui/input';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filterType, setFilterType] = useState('specialization');
  const [filterValue, setFilterValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctors = async (filterType = '', value = '') => {
    setIsLoading(true);
    let url = 'http://localhost:4000/doctor/filter';
    if (filterType && value) {
      url += `?${filterType}=${value}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleFilter = () => {
    fetchDoctors(filterType, filterValue);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Find Doctors</h1>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Filter</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-3">
            <select
              className="border p-2 rounded w-full"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="specialization">Specialization</option>
              <option value="location">Location</option>
            </select>
            <Input
              placeholder={`Enter ${filterType}`}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
            <Button onClick={handleFilter} className="w-full">
              Apply Filter
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : doctors.length === 0 ? (
        <p>No doctors found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor._id}>
              <CardHeader>
                <h2 className="text-lg font-semibold text-blue-600">{doctor.name}</h2>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><strong>Email:</strong> {doctor.email}</p>
                <p><strong>License:</strong> {doctor.liscence}</p>
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                <p><strong>Location:</strong> {doctor.location}</p>
                <a
                  href={`/doctors/profile/${doctor._id}`}
                  className="inline-block mt-2 text-blue-500 hover:underline"
                >
                  Book Appointment →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;

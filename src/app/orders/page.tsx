"use client"; // Mark as client component

import React, { useState, useEffect } from "react";
import Map from "../components/Map";
import { Location } from "../parking/page";
import { UserData } from "../components/ParkingSpace";
import { useRouter } from 'next/navigation'

// Types for reservation data
export type Reservation = {
  id: number;
  userId: number;
  endTime: string;
  startTime: string;
  place: string;
  paymentStatus: number;
  parkingSpaceId: number;
  points: number;
  position: Position;
};

export type Position = {
  lat: number;
  lng: number;
};

const Orders: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [user, setUser] = useState<UserData>({} as UserData);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [userHistoricalReservations, setUserHistoricalReservations] = useState<Reservation[]>([]);
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const response = await fetch(process.env.SERVER_DOMAIN + "/member/currentUser", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const text = await response.text();
      if (text !== "") {
        const json = JSON.parse(text) as UserData;
        setUser(json);
        // Return user data for immediate use
        return json;
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const getLocations = async () => {
    const apiUrl = process.env.SERVER_DOMAIN + "/location/getAllLocations";
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setLocations(
        data.map((el: any) => ({
          id: el.id,
          city: el.city,
          position: {
            lat: el.lat,
            lng: el.lng,
          } as Position,
        }))
      );
    } catch (error) {
        console.error("Error fetching location data", error);
    }
  };

  const getUserReservations = async (id: number) => {
    const apiUrl = process.env.SERVER_DOMAIN + "/reservation/getUserReservations?Id=" + (id ?? 0);
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      setUserReservations(
        data.map((el: any) => ({
          id: el.reservationId,
          userId: el.userId,
          endTime: el.endTime,
          startTime: el.startTime,
          place: el.place,
          paymentStatus: el.paymentStatus,
          parkingSpaceId: el.parkingSpaceId,
          points: el.points,
          position: {
            lat: el.lat,
            lng: el.lng,
          } as Position,
        } as Reservation))
      );
    } catch (error) {
        console.error("Error fetching reservation data", error);
    }
  };

  const getUserHistoricalReservations = async (id: number) => {
    const apiUrl = process.env.SERVER_DOMAIN + "/historical_reservation/getUserReservations?Id=" + (id ?? 0);
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      setUserHistoricalReservations(
        data.map((el: any) => ({
          id: el.reservationId,
          userId: el.userId,
          endTime: el.endTime,
          startTime: el.startTime,
          place: el.place,
          paymentStatus: el.paymentStatus,
          parkingSpaceId: el.parkingSpaceId,
          points: el.points,
          position: {
            lat: el.lat,
            lng: el.lng,
          } as Position,
        } as Reservation))
      );
    } catch (error) {
        console.error("Error fetching reservation history data", error);
    }
  };

  const payForReservation = async (id: number) => {
    console.log("Pay for reservation", id);
    fetch(process.env.SERVER_DOMAIN + "/payments/checkout", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: (userReservations.find(r => r.id === id)?.points ?? 100) * 100,
        quantity: 1,
        name: `Parking Reservation ${id}`,
        currency: "PLN",
      }),
      credentials: 'include'
    })
      .then(async response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text) })
        }

        let res = await response.json();

        if (res.status === "SUCCESS") {
          console.log("Payment successful!");
          localStorage.setItem("reservationId", id.toString());
          window.location.href = res.sessionUri;
        }
      })
      .catch((error) => {
        alert("Payment failed! Please try again.");
      }
    )
  };

  const cancelReservation = async (id: number) => {
    console.log("Cancel reservation", id);
    fetch(process.env.SERVER_DOMAIN + "/reservation/delete?Id=" + id, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(async response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text) })
        }

        let oldReservations = userReservations;
        oldReservations = oldReservations.map((el) => {
          if (el.id === id) {
            el.paymentStatus = 0;
          }
          return el;
        });

        setUserReservations(oldReservations);
        getUserReservations(user.id);

        window.alert("Reservation cancelled successfully!");
      })
      .catch((error) => {
        alert("Cancelling reservation failed! Please try again." + error);
      }
    )
  };

  useEffect(() => {
    const initializeData = async () => {
      const userData = await fetchUser();
      if (userData?.id) {
        await getUserReservations(userData.id);
        await getUserHistoricalReservations(userData.id);
      }
      getLocations();
    };

    initializeData();
  }, []);

  const selectLocation = (id: number) => {
    // ? Handle location selection
    // setSelectedLocation(id);
    // setSelectedSpace(0);
  };

  //? Handle reservation click and update the map's location
  const handleReservationClick = (position: Position) => {
    console.log("Reservation clicked", position);
  //   const latLng = new google.maps.LatLng(position.lat, position.lng);
  //   setSelectedLocation(latLng);
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6">
    <h2 className="text-3xl font-semibold text-left text-blue-600 mb-8">Your Reservations</h2>
      <div className="w-full py-4 px-8 rounded-lg flex flex-col justify-center">
        <div className="w-full max-w-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
              {userReservations.length > 0 ? (
                userReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    onClick={() => handleReservationClick(reservation.position)}
                    className="flex-row justify-center items-center bg-gray-200 p-8 mb-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 focus:outline-none"
                  >
                    <p className="text-2xl mb-4 text-center">
                      <strong className="text-blue-400">Start Time:</strong> {reservation.startTime}
                      <strong className="text-blue-400">&nbsp;End Time:</strong> {reservation.endTime}
                    </p>
                    <p className="text-2xl mb-4 text-center">
                      <strong className="text-blue-500">Parking Space:</strong> {reservation.parkingSpaceId}
                    </p>
                    <p className="text-2xl mb-4 text-center">
                      <strong className="text-blue-600">Payment Status:&nbsp;</strong>
                      {reservation.paymentStatus == null ?
                        <button className="underline" onClick={() => payForReservation(reservation.id)}>Awaiting Payment</button>
                       : reservation.paymentStatus === 1 ? "Paid" : "Failed"}
                    </p>
                    <p className="text-2xl mb-4 text-center">
                      <button className="underline text-red-600" onClick={() => cancelReservation(reservation.id)}>Cancel</button>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xl text-gray-500">No reservations found.</p>
              )}
            </div>
            <div className="bg-white shadow-lg rounded-lg h-[500px] relative">
              <div className="absolute inset-0">
                <Map locations={locations} selectLocation={selectLocation} />
              </div>
            </div>
          </div>
        </div>

        {/* Reservation History Section Below Reservations */}
        <div className="w-full px-8 md:px-16 xl:px-32 py-8 mt-12 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold mb-4 text-blue-600">Reservation History</h2>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left text-lg font-medium text-gray-700">Start Time</th>
                <th className="py-2 px-4 text-left text-lg font-medium text-gray-700">End Time</th>
                <th className="py-2 px-4 text-left text-lg font-medium text-gray-700">Parking Space</th>
                <th className="py-2 px-4 text-left text-lg font-medium text-gray-700">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {userHistoricalReservations.map((reservation) => (
                <tr key={reservation.id} className="border-b">
                  <td className="py-4 px-4 text-lg text-gray-700">{reservation.startTime}</td>
                  <td className="py-4 px-4 text-lg text-gray-700">{reservation.endTime}</td>
                  <td className="py-4 px-4 text-lg text-gray-700">{reservation.parkingSpaceId}</td>
                  <td className="py-4 px-4 text-lg text-gray-700">{reservation.paymentStatus === 1 ? "Paid" : "Failed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default Orders;

import React, { useState, useEffect } from "react";
import axios from "axios";

const facilities = [
  {
    name: "Clubhouse",
    slots: [
      { startTime: "10:00", endTime: "16:00", amount: 100 },
      { startTime: "16:00", endTime: "22:00", amount: 500 },
    ],
  },
  {
    name: "Tennis Court",
    slots: [{ startTime: "00:00", endTime: "23:59", amount: 50 }],
  },
];

const BookFacility = () => {
  const [bookings, setBookings] = useState([]);
  const [bookingResult, setBookingResult] = useState("");

  const formatDateTime = (date, time) => {
    const [day, month, year] = date.split("-");
    const [hours, minutes] = time.split(":");
    return new Date(year, month - 1, day, hours, minutes);
  };

  const isFacilityAlreadyBooked = (facilityName, startTime, endTime) => {
    return bookings.some(
      (booking) =>
        booking.facility === facilityName &&
        new Date(booking.endTime) >= new Date(startTime) &&
        new Date(booking.startTime) <= new Date(endTime)
    );
  };

  const handleBooking = async (facilityName, date, startTime, endTime) => {
    const facility = facilities.find((f) => f.name === facilityName);
    if (!facility) {
      console.log("Facility not found!");
      return;
    }

    const bookingStartTime = formatDateTime(date, startTime);
    const bookingEndTime = formatDateTime(date, endTime);

    if (
      isFacilityAlreadyBooked(facilityName, bookingStartTime, bookingEndTime)
    ) {
      setBookingResult("Booking Failed, Already Booked");
      return;
    }

    let bookingAmount = 0;
    for (const slot of facility.slots) {
      const slotStartTime = formatDateTime(date, slot.startTime);
      const slotEndTime = formatDateTime(date, slot.endTime);
      if (bookingStartTime >= slotStartTime && bookingEndTime <= slotEndTime) {
        bookingAmount +=
          (slot.amount * (bookingEndTime - bookingStartTime)) / 3600000;
        break;
      }
    }

    try {
      const response = await axios.post("http://localhost:3001/bookings", {
        facility: facilityName,
        startTime: bookingStartTime.toString(),
        endTime: bookingEndTime.toString(),
        amount: bookingAmount,
      });
      setBookings([...bookings, response.data]);
      setBookingResult(`Booked, Rs. ${bookingAmount}`);
    } catch (error) {
      console.error("Error while booking:", error);
      setBookingResult("Booking Failed");
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/bookings")
      .then((response) => setBookings(response.data))
      .catch((error) => console.error("Error while fetching bookings:", error));
  }, []);

  return (
    <div>
      <h1>Facility Booking</h1>
      <button
        onClick={() =>
          handleBooking("Clubhouse", "2020-10-26", "16:00", "22:00")
        }
      >
        Book Clubhouse (4pm to 10pm)
      </button>
      <button
        onClick={() =>
          handleBooking("Tennis Court", "2020-10-26", "16:00", "20:00")
        }
      >
        Book Tennis Court (4pm to 8pm)
      </button>
      <button
        onClick={() =>
          handleBooking("Clubhouse", "2020-10-26", "16:00", "22:00")
        }
      >
        Book Clubhouse Again (4pm to 10pm)
      </button>
      <button
        onClick={() =>
          handleBooking("Tennis Court", "2020-10-26", "17:00", "21:00")
        }
      >
        Book Tennis Court Again (5pm to 9pm)
      </button>

      {/* Display booking result */}
      <p>{bookingResult}</p>

      {/* Display booked facilities */}
      <h2>Booked Facilities:</h2>
      <ul>
        {bookings.map((booking, index) => (
          <li key={index}>
            Facility: {booking.facility}, Start Time: {booking.startTime}, End
            Time: {booking.endTime}, Amount: Rs. {booking.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookFacility;

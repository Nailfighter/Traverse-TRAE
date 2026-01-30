import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useMemo, useState } from "react";

function convertTo12Hour(time24) {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

function convertTo24Hour(time12) {
  const [timePart, ampm] = time12.split(" ");
  let [hour, minute] = timePart.split(":").map(Number);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}:00`;
}

const TimeSetter = ({ time, setTime, isError = false }) => {
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const minuteStr = m < 10 ? `0${m}` : `${m}`;
        const ampm = h < 12 ? "AM" : "PM";
        slots.push(`${hour12}:${minuteStr} ${ampm}`);
      }
    }
    return slots;
  }, []);

  const formattedTime = convertTo12Hour(time);

  return (
    <Dropdown className="min-w-25">
      <DropdownTrigger className="mt-0.5">
        <span
          className={`text-[14px] font-medium ${
            isError
              ? "text-red-500 hover:text-red-600"
              : "text-subcolor hover:text-black"
          }`}
        >
          {formattedTime}
        </span>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Select a time slot"
        onAction={(key) => setTime(convertTo24Hour(key))}
        classNames={{
          list: "max-h-[168px] overflow-y-auto scrollbar-hide",
        }}
      >
        {timeSlots.map((time) => (
          <DropdownItem key={time} textValue={time}>
            {time}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default TimeSetter;

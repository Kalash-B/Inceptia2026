import { useEffect, useState } from "react";

// Countdown Component
function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = () => {
    const targetDate = new Date("2026-08-07T09:00:00");
    const difference = targetDate.getTime() - Date.now();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-between text-center mt-2 px-2 w-full max-w-sm mx-auto">
      <div>
        <span className="block font-headline-lg text-3xl text-primary-container font-bold">
          {timeLeft.days}
        </span>
        <span className="font-label-md text-xs text-on-surface-variant tracking-wider">
          DAYS
        </span>
      </div>

      <span className="font-headline-lg text-2xl text-outline-variant font-bold">
        :
      </span>

      <div>
        <span className="block font-headline-lg text-3xl text-primary-container font-bold">
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        <span className="font-label-md text-xs text-on-surface-variant tracking-wider">
          HOURS
        </span>
      </div>

      <span className="font-headline-lg text-2xl text-outline-variant font-bold">
        :
      </span>

      <div>
        <span className="block font-headline-lg text-3xl text-primary-container font-bold">
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        <span className="font-label-md text-xs text-on-surface-variant tracking-wider">
          MINS
        </span>
      </div>

      <span className="font-headline-lg text-2xl text-outline-variant font-bold">
        :
      </span>

      <div>
        <span className="block font-headline-lg text-3xl text-primary-container font-bold">
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
        <span className="font-label-md text-xs text-on-surface-variant tracking-wider">
          SECS
        </span>
      </div>
    </div>
  );
}

export default Countdown;
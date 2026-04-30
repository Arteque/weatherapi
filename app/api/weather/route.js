import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  const LAT = "34.2610100";
  const LON = "-6.5802000";

  // Date Logic
  let sessionDates = [];
  let d = new Date();
  while (sessionDates.length < 2) {
    if (d.getDay() === 0 || d.getDay() === 6) {
      sessionDates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`,
    );
    const data = await response.json();

    const result = sessionDates
      .map((sDate, index) => {
        const now = new Date().toLocaleDateString(document.head.lang || "en-US", {
          weekday: "numeric",
          day: "numeric",
          month: "numeric",
          year:"numeric"
        });
        const targetStr = sDate.toDateString();
        const forecast = data.list.find((entry) => {
          const entryDate = new Date(entry.dt * 1000);
          return (
            entryDate.toDateString() === targetStr && entryDate.getHours() >= 15
          );
        });

        if (!forecast) return null;




        return {
          session: index + 1,
          now: now,
          date: targetStr,
          training_time: "17:00",
          weather: {
            temp: Math.round(forecast.main.temp),
            condition: forecast.weather[0].description,
            icon_class: "fa-" + forecast.weather[0].main.toLowerCase(), // Simplified for example
            wind: {
              speed_kmh: (forecast.wind.speed * 3.6).toFixed(1),
              direction: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
                Math.round(forecast.wind.deg / 45) % 8
              ],
            },
          },
        };
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

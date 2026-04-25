export async function getTrainingData() {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  const LAT = 34.2610100;
  const LON = -6.5802000;

  // 1. Calculate target dates (Next 2 Sat/Sun)
  let sessionDates = [];
  let d = new Date();
  while (sessionDates.length < 2) {
    if (d.getDay() === 0 || d.getDay() === 6) {
      sessionDates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`,
    { next: { revalidate: 3600 } } // Cache for 1 hour
  );
  
  const data = await res.json();

  // 2. Map to clean JSON format
  const trainingSessions = sessionDates
    .map((sDate) => {
      const targetStr = sDate.toDateString();
      const forecast = data.list?.find((entry) => {
        const entryDate = new Date(entry.dt * 1000);
        return entryDate.toDateString() === targetStr && entryDate.getHours() >= 15;
      });

      if (!forecast) return null;

      return {
        date: targetStr,
        displayDate: sDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        time: "17:00",
        temp: Math.round(forecast.main.temp),
        description: forecast.weather[0].description,
        iconCode: forecast.weather[0].icon.substring(0, 2),
        wind: {
          speed: (forecast.wind.speed * 3.6).toFixed(1),
          deg: forecast.wind.deg,
          direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(forecast.wind.deg / 45) % 8]
        }
      };
    })
    .filter(Boolean); // Remove nulls (out of range)

  return trainingSessions;
}
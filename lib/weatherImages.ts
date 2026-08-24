// Maps an OpenWeatherMap icon code (e.g. "10d") to a background image filename
// under /public/images/weather/. Upload your own images with these exact
// names — anything missing just falls back to the panel gradient (see
// .weather-hero-bg in globals.css), so partial sets are fine.
const ICON_TO_IMAGE: Record<string, string> = {
  '01d': 'clear-day.jpg',
  '01n': 'clear-night.jpg',
  '02d': 'cloudy-day.jpg',
  '02n': 'cloudy-night.jpg',
  '03d': 'cloudy-day.jpg',
  '03n': 'cloudy-night.jpg',
  '04d': 'cloudy-day.jpg',
  '04n': 'cloudy-night.jpg',
  '09d': 'rain.jpg',
  '09n': 'rain.jpg',
  '10d': 'rain.jpg',
  '10n': 'rain.jpg',
  '11d': 'storm.jpg',
  '11n': 'storm.jpg',
  '13d': 'snow.jpg',
  '13n': 'snow.jpg',
  '50d': 'mist.jpg',
  '50n': 'mist.jpg',
}

export const WEATHER_IMAGE_FILENAMES = [
  'clear-day.jpg',
  'clear-night.jpg',
  'cloudy-day.jpg',
  'cloudy-night.jpg',
  'rain.jpg',
  'storm.jpg',
  'snow.jpg',
  'mist.jpg',
  'default.jpg',
]

export function weatherBackgroundUrl(iconCode: string | null): string {
  const file = (iconCode && ICON_TO_IMAGE[iconCode]) || 'default.jpg'
  return `/images/weather/${file}`
}

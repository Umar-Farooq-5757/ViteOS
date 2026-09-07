import type { IconType } from "react-icons";
import {
  FaBug,
  FaCarSide,
  FaCloudRain,
  FaCloudShowersHeavy,
  FaFan,
  FaFire,
  FaLeaf,
  FaMoon,
  FaMugHot,
  FaPlane,
  FaTractor,
  FaTree,
  FaUmbrellaBeach,
  FaWater,
} from "react-icons/fa";
import {
  FaCloudBolt,
  FaHouseChimneyWindow,
  FaTrainSubway,
} from "react-icons/fa6";

export interface Ambience {
  id: string;
  label: string;
  url: string;
  icon: IconType;
}

export const AMBIENCES: Ambience[] = [
  {
    id: "fire",
    label: "Fireplace",
    url: "https://actions.google.com/sounds/v1/ambiences/fire.ogg",
    icon: FaFire,
  },
  {
    id: "coffee",
    label: "Coffee Shop",
    url: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    icon: FaMugHot,
  },
  {
    id: "air-conditioner",
    label: "Air Conditioner",
    url: "https://actions.google.com/sounds/v1/ambiences/ambient_hum_air_conditioner.ogg",
    icon: FaFan,
  },
  {
    id: "light-rain",
    label: "Light Rain",
    url: "https://actions.google.com/sounds/v1/weather/light_rain.ogg",
    icon: FaCloudRain,
  },
  {
    id: "rain-on-roof",
    label: "Rain on Roof",
    url: "https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg",
    icon: FaHouseChimneyWindow,
  },
  {
    id: "rain",
    label: "Heavy Rain",
    url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
    icon: FaCloudShowersHeavy,
  },
  {
    id: "thunder",
    label: "Thunderstorm",
    url: "https://actions.google.com/sounds/v1/weather/thunderstorm_long.ogg",
    icon: FaCloudBolt,
  },
  {
    id: "stream",
    label: "Flowing Stream",
    url: "https://actions.google.com/sounds/v1/water/small_stream_flowing.ogg",
    icon: FaWater,
  },
  {
    id: "shoreline",
    label: "Water Lapping",
    url: "https://actions.google.com/sounds/v1/water/water_lapping_wind.ogg",
    icon: FaUmbrellaBeach,
  },
  {
    id: "ocean-waves",
    label: "Rock Beach Waves",
    url: "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg",
    icon: FaUmbrellaBeach,
  },
  {
    id: "summer-forest",
    label: "Summer Forest",
    url: "https://actions.google.com/sounds/v1/ambiences/summer_forest.ogg",
    icon: FaTree,
  },
  {
    id: "jungle-morning",
    label: "Jungle Morning",
    url: "https://actions.google.com/sounds/v1/ambiences/jungle_atmosphere_morning.ogg",
    icon: FaLeaf,
  },
  {
    id: "crickets",
    label: "Crickets & Traffic",
    url: "https://actions.google.com/sounds/v1/ambiences/crickets_with_distant_traffic.ogg",
    icon: FaMoon,
  },
  {
    id: "cicada",
    label: "Cicadas",
    url: "https://actions.google.com/sounds/v1/animals/cicada_chirp.ogg",
    icon: FaBug,
  },
  {
    id: "farm",
    label: "Morning Farm",
    url: "https://actions.google.com/sounds/v1/ambiences/farm_morning_with_sheep.ogg",
    icon: FaTractor,
  },
  {
    id: "airplane-cabin",
    label: "Airplane Cabin",
    url: "https://actions.google.com/sounds/v1/transportation/airplane_in_flight.ogg",
    icon: FaPlane,
  },
  {
    id: "subway-ride",
    label: "Subway Ride",
    url: "https://actions.google.com/sounds/v1/transportation/subway_nyc_in_motion.ogg",
    icon: FaTrainSubway,
  },
  {
    id: "highway",
    label: "Waterfront Highway",
    url: "https://actions.google.com/sounds/v1/ambiences/highway_near_waterfront.ogg",
    icon: FaCarSide,
  },
];

/** Default starting volume (0–1) for a freshly enabled track. */
export const DEFAULT_AMBIENCE_VOLUME = 0.6;

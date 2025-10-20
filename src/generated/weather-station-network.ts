// Generated from src\content\weather-station-network.mdx
export const frontmatter = {
  "title": "Embedded Weather Station Network",
  "date": "2024-01-20",
  "description": "A distributed network of solar-powered weather monitoring stations with LoRaWAN connectivity, featuring custom sensors and long-range data transmission.",
  "tags": [
    "Embedded Systems",
    "LoRaWAN",
    "Solar Power",
    "Weather Monitoring",
    "C++"
  ],
  "featured": false,
  "gantt": false,
  "timeline": [
    {
      "title": "Sensor Selection & Testing",
      "date": "2023-10-01",
      "link": "#sensors"
    },
    {
      "title": "LoRaWAN Integration",
      "date": "2023-11-01",
      "link": "#lorawan"
    },
    {
      "title": "Power Management Design",
      "date": "2023-11-15",
      "link": "#power"
    },
    {
      "title": "Field Deployment",
      "date": "2023-12-15",
      "link": "#deployment"
    }
  ]
};
export const content = "\r\n# Embedded Weather Station Network\r\n\r\nDevelopment of a network of autonomous weather monitoring stations for agricultural and environmental monitoring applications.\r\n\r\n## <a id=\"sensors\"></a>System Overview\r\n\r\nThe weather stations collect comprehensive environmental data including:\r\n\r\n- Temperature and humidity (±0.1°C, ±2% RH accuracy)\r\n- Atmospheric pressure (±0.1 hPa)\r\n- Wind speed and direction\r\n- Rainfall measurement\r\n- Solar irradiance\r\n- Soil temperature and moisture\r\n\r\n## <a id=\"lorawan\"></a>Communication Architecture\r\n\r\nEach station transmits data via LoRaWAN to a central gateway, providing:\r\n\r\n- **Range**: Up to 15km in rural environments\r\n- **Battery Life**: >5 years with solar charging\r\n- **Data Rate**: Hourly measurements with alert capability\r\n- **Network Capacity**: 100+ stations per gateway\r\n\r\n## <a id=\"power\"></a>Power Management\r\n\r\nSophisticated power management system featuring:\r\n\r\n- 10W solar panel with MPPT charging\r\n- 18650 Li-ion battery pack (7.2V, 6600mAh)\r\n- Ultra-low power sleep modes (<10µA)\r\n- Dynamic duty cycling based on battery level\r\n\r\n## <a id=\"deployment\"></a>Results\r\n\r\nSuccessfully deployed 25 stations across 500 hectares of agricultural land, providing farmers with real-time weather data for irrigation and crop management decisions.\r\n\r\n---\r\n\r\nThis project showcases embedded systems design, wireless communication protocols, and sustainable power solutions for remote monitoring applications.";
export const html = "<h1>Embedded Weather Station Network</h1>\n<p>Development of a network of autonomous weather monitoring stations for agricultural and environmental monitoring applications.</p>\n<h2>System Overview</h2>\n<p>The weather stations collect comprehensive environmental data including:</p>\n<ul>\n<li>Temperature and humidity (±0.1°C, ±2% RH accuracy)</li>\n<li>Atmospheric pressure (±0.1 hPa)</li>\n<li>Wind speed and direction</li>\n<li>Rainfall measurement</li>\n<li>Solar irradiance</li>\n<li>Soil temperature and moisture</li>\n</ul>\n<h2>Communication Architecture</h2>\n<p>Each station transmits data via LoRaWAN to a central gateway, providing:</p>\n<ul>\n<li><strong>Range</strong>: Up to 15km in rural environments</li>\n<li><strong>Battery Life</strong>: >5 years with solar charging</li>\n<li><strong>Data Rate</strong>: Hourly measurements with alert capability</li>\n<li><strong>Network Capacity</strong>: 100+ stations per gateway</li>\n</ul>\n<h2>Power Management</h2>\n<p>Sophisticated power management system featuring:</p>\n<ul>\n<li>10W solar panel with MPPT charging</li>\n<li>18650 Li-ion battery pack (7.2V, 6600mAh)</li>\n<li>Ultra-low power sleep modes (&#x3C;10µA)</li>\n<li>Dynamic duty cycling based on battery level</li>\n</ul>\n<h2>Results</h2>\n<p>Successfully deployed 25 stations across 500 hectares of agricultural land, providing farmers with real-time weather data for irrigation and crop management decisions.</p>\n<hr>\n<p>This project showcases embedded systems design, wireless communication protocols, and sustainable power solutions for remote monitoring applications.</p>";
export const slug = "weather-station-network";

export default {
  frontmatter,
  content,
  html,
  slug
};

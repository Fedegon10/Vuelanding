import axios from "axios";

/* ===========================================================
   🔑 CONFIGURACIÓN DE API KEYS
   =========================================================== */
const PEXELS_API_KEY =
  "geDvKnwPeusMxn5V2MKH8jHrVvsEv8x7VfN9z3uYFJCVkPQCmRxbS1gz";
const GEOAPIFY_API_KEY = "be975a82c18143519bf68488842450a3";
const EXCHANGE_RATE_API_KEY = "8930cdfc7c52ca6054a0cab9";

/* ===========================================================
   🌅 APIs DE IMÁGENES (Pexels)
   =========================================================== */
const PEXELS_API_URL = "https://api.pexels.com/v1/search";

const fetchImageFromPexels = async (query, cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
    if (!PEXELS_API_KEY) {
      console.warn("⚠️ Clave de API de Pexels no encontrada.");
      return `https://placehold.co/1200x800/8b7ff6/ffffff?text=Vuelanding`;
    }
    const enhancedQuery = `${query} travel landmark landscape city`;
    const randomPage = Math.floor(Math.random() * 5) + 1;
    const response = await axios.get(PEXELS_API_URL, {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query: enhancedQuery, per_page: 3, page: randomPage },
    });
    const photo = response.data.photos?.[0];
    const imageUrl =
      photo?.src?.large2x ||
      `https://placehold.co/1200x800/8b7ff6/ffffff?text=${encodeURIComponent(
        query
      )}`;
    localStorage.setItem(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error(`❌ Error al buscar "${query}" en Pexels:`, error);
    return `https://placehold.co/1200x800/ff0000/ffffff?text=Error`;
  }
};

export const fetchDestinationCoverImage = async (city, country) => {
  const cacheKey = `dest_img_${city}_${country}`;
  return fetchImageFromPexels(`${city} ${country}`, cacheKey);
};

export const fetchItineraryCoverImage = async (city, country) => {
  const cacheKey = `itinerary_img_${city}_${country}`;
  return fetchImageFromPexels(`${city} ${country} landmark`, cacheKey);
};

export const clearImageCache = () => {
  Object.keys(localStorage)
    .filter(
      (key) => key.startsWith("dest_img_") || key.startsWith("itinerary_img_")
    )
    .forEach((key) => localStorage.removeItem(key));
  console.log("🧹 Caché de imágenes limpiado.");
};

/* ===========================================================
   🌍 APIs DE DATOS GEOGRÁFICOS Y MONEDAS
   =========================================================== */
const COUNTRIES_API_URL = "https://restcountries.com/v3.1/all";

export const fetchCountries = async () => {
  try {
    const response = await axios.get(
      `${COUNTRIES_API_URL}?fields=name,translations,cca2,currencies,flags`
    );
    return response.data
      .filter(
        (country) =>
          country &&
          country.currencies &&
          Object.keys(country.currencies).length > 0 &&
          country.translations?.spa?.common &&
          country.flags?.svg
      )
      .map((country) => {
        const currencyCode = Object.keys(country.currencies)[0];
        const currencyInfo = country.currencies[currencyCode];
        return {
          name: country.translations.spa.common,
          commonName: country.name.common,
          currencyCode,
          currencyName: currencyInfo.name,
          flag: country.flags.svg,
          cca2: country.cca2,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

export const fetchCities = async (countryName) => {
  try {
    const response = await axios.post(
      "https://countriesnow.space/api/v0.1/countries/cities",
      { country: countryName }
    );
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching cities for ${countryName}:`, error);
    return [];
  }
};

export const fetchCoordinates = async (city, country) => {
  if (!city || !country) return null;
  try {
    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/search",
      {
        params: { text: `${city}, ${country}`, apiKey: GEOAPIFY_API_KEY },
      }
    );
    if (response.data?.features?.length > 0) {
      const { lat, lon } = response.data.features[0].properties;
      return { lat, lng: lon };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching coordinates for ${city}:`, error);
    return null;
  }
};

export const fetchConversionRates = async (baseCurrency = "USD") => {
  if (!baseCurrency) return null;
  try {
    const response = await axios.get(
      `https://api.frankfurter.app/latest?from=${baseCurrency}`
    );
    return { ...response.data.rates, [baseCurrency]: 1 };
  } catch (error) {
    console.error(
      `Error fetching conversion rates for ${baseCurrency}:`,
      error
    );
    return null;
  }
};

export const fetchExchangeRates = async (baseCurrency = "USD") => {
  if (
    !EXCHANGE_RATE_API_KEY ||
    EXCHANGE_RATE_API_KEY === "TU_API_KEY_DE_EXCHANGERATE_API"
  ) {
    console.error("API Key de ExchangeRate no configurada.");
    return null;
  }
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`
    );
    return response.data.conversion_rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
};

/* ===========================================================
   🏛️ SUGERENCIAS DE ATRACCIONES CON IMAGEN Y ESTRELLAS
   =========================================================== */
export const fetchAttractionSuggestions = async (city, country) => {
  if (!city || !country) return [];

  const coordinates = await fetchCoordinates(city, country);
  if (!coordinates) return [];
  const { lat, lng } = coordinates;

  const getImage = async (query) => {
    const cacheKey = `attraction_img_${query}`;
    return fetchImageFromPexels(query, cacheKey);
  };

  try {
    const categories = [
      "tourism.attraction",
      "tourism.sights",
      "entertainment.amusement_park",
      "entertainment.theme_park",
      "leisure.park",
      "natural.sight",
      "natural.springs",
    ];
    const categoryParam = encodeURIComponent(categories.join(","));
    const url = `https://api.geoapify.com/v2/places?categories=${categoryParam}&filter=circle:${lng},${lat},10000&limit=10&apiKey=${GEOAPIFY_API_KEY}`;

    const geoResponse = await axios.get(url);
    const geoPlaces =
      geoResponse.data?.features?.map((f) => {
        const p = f.properties || {};
        return {
          name: p.name || "Atracción sin nombre",
          category: (p.categories?.[0]?.split(".")[1] || "Atracción")
            .replace("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          source: "Geoapify",
          rating: Math.min(5, Math.max(1, Math.round((p.rank || 80) / 20))),
        };
      }) || [];

    const withImages = await Promise.all(
      geoPlaces.map(async (p) => ({
        ...p,
        imageUrl: await getImage(`${p.name} ${city}`),
      }))
    );

    return withImages;
  } catch (error) {
    console.warn("⚠️ Geoapify falló, usando Wikipedia:", error.message);
    try {
      const wikiResponse = await axios.get(
        "https://es.wikipedia.org/w/api.php",
        {
          params: {
            action: "query",
            list: "geosearch",
            gscoord: `${lat}|${lng}`,
            gsradius: 8000,
            gslimit: 10,
            format: "json",
            origin: "*",
          },
        }
      );

      const wikiPlaces =
        wikiResponse.data.query?.geosearch?.map((p) => ({
          name: p.title,
          category: "Punto de interés",
          source: "Wikipedia",
          rating: Math.floor(Math.random() * 3) + 3,
        })) || [];

      const withImages = await Promise.all(
        wikiPlaces.map(async (p) => ({
          ...p,
          imageUrl: await getImage(`${p.name} ${city}`),
        }))
      );

      return withImages;
    } catch (fallbackError) {
      console.error("❌ Error total al obtener sugerencias:", fallbackError);
      return [];
    }
  }
};

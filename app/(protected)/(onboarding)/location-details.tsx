import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '~/components/Button'; // Assuming you have a reusable Button component
import { StyledText } from '~/components/StyledText'; // Assuming you have a reusable StyledText component
import { useOnboarding } from '~/providers/onboarding-provider';

// --- Custom Debounce Hook ---
// This hook delays updating a value until a certain amount of time has passed without it changing.
// This is useful for delaying API calls until the user has stopped typing.
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes or the component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// IMPORTANT: Add your GeoDB API key to your environment variables
const GEO_API_KEY = process.env.EXPO_PUBLIC_GEO_API_KEY;
const GEO_API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';

interface CitySuggestion {
  id: number;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

// A styled version of the FlatList for NativeWind

export default function LocationDetails() {
  const { userData, setUserData } = useOnboarding();
  const router = useRouter();

  const [cityInput, setCityInput] = useState(userData.city || '');
  const [countryInput, setCountryInput] = useState(userData.country || '');

  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCitySelected, setIsCitySelected] = useState(!!(userData.city && userData.country));

  // Use the custom debounce hook to delay API calls
  const debouncedCitySearch = useDebounce(cityInput, 500);

  useEffect(() => {
    // This effect triggers the API call when the debounced search term changes
    const fetchCities = async () => {
      // Don't search if the input is empty, too short, or if a city has already been selected
      if (debouncedCitySearch.length < 2 || isCitySelected) {
        setCitySuggestions([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${GEO_API_URL}/cities?minPopulation=10000&namePrefix=${debouncedCitySearch}&sort=-population`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': GEO_API_KEY ?? '',
              'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
            },
          }
        );
        const data = await response.json();
        if (data && data.data) {
          setCitySuggestions(data.data);
        } else {
          setCitySuggestions([]);
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err);
        setError('Could not fetch locations. Please try again.');
        setCitySuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [debouncedCitySearch, isCitySelected]);

  const handleCityChange = (text: string) => {
    setCityInput(text);
    // When user starts typing again, we reset the selection
    if (isCitySelected) {
      setIsCitySelected(false);
      setCountryInput(''); // Clear country when city changes
      setUserData({
        ...userData,
        city: '',
        country: '',
        location: { latitude: 0, longitude: 0 },
      });
    }
  };

  const onCitySelect = (city: CitySuggestion) => {
    Keyboard.dismiss();
    setCityInput(city.city);
    setCountryInput(city.country);
    setUserData({
      ...userData,
      city: city.city,
      country: city.country,
      location: {
        latitude: city.latitude,
        longitude: city.longitude,
      },
    });
    setCitySuggestions([]);
    setIsCitySelected(true); // Mark city as selected
  };

  const handleContinue = () => {
    // Navigate to the next screen in the onboarding flow
    router.push('/(protected)/(onboarding)/languages-and-interests'); // Example next route
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 justify-center px-6 pb-12">
        <StyledText className="mb-2 text-center font-playfair text-3xl tracking-tighter">
          Your Location
        </StyledText>
        <StyledText className="mb-8 text-center font-inter text-base text-zinc-600">
          Where in the world are you writing from?
        </StyledText>

        <View className="gap-5">
          {/* City Input */}
          <View>
            <StyledText className="mb-1.5 font-inter text-zinc-700">City</StyledText>
            <View
              className="border border-zinc-200 bg-zinc-50 px-4 py-3"
              style={{ borderRadius: 0 }}>
              <TextInput
                placeholder="Start typing your city..."
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="off"
                autoFocus={true}
                value={cityInput}
                onChangeText={handleCityChange}
                className="font-inter text-zinc-900"
              />
            </View>
            {loading && <ActivityIndicator size="small" color="#71717a" className="mt-2" />}
            {citySuggestions.length > 0 && (
              <FlatList
                className="mt-1 max-h-48 border border-zinc-200 bg-white"
                data={citySuggestions}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }: { item: any }) => (
                  <TouchableOpacity
                    className="border-b border-zinc-100 p-3"
                    onPress={() => onCitySelect(item)}>
                    <StyledText className="font-inter text-zinc-800">{`${item.city}, ${item.country}`}</StyledText>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>

          {/* Country Input (Read-only) */}
          <View>
            <StyledText className="mb-1.5 font-inter text-zinc-700">Country</StyledText>
            <View
              className="border border-zinc-100 bg-zinc-100 px-4 py-3"
              style={{ borderRadius: 0 }}>
              <TextInput
                placeholder="Country will appear here"
                value={countryInput}
                editable={false}
                className="font-inter text-zinc-500"
              />
            </View>
          </View>
        </View>

        {error && (
          <StyledText className="mt-4 text-center font-inter text-red-500">{error}</StyledText>
        )}

        <Button
          className="mt-8 items-center justify-center py-3 disabled:opacity-40"
          textClassName="text-white text-xl font-playfair-bold"
          onPress={handleContinue}
          disabled={!isCitySelected}
          style={{ borderRadius: 0 }}>
          Continue
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

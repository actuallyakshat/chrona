import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '~/components/Button';
import { StyledText } from '~/components/StyledText';
import Slider from '@react-native-community/slider';
import { Slider as RangeSlider } from '@miblanchard/react-native-slider';
import { INTERESTS, LANGUAGES } from '~/constants/languages-and-interests-options';
import { Gender, Preferences, useOnboarding } from '~/providers/onboarding-provider';

// Reusable Badge from the previous screen
const Badge = ({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className={`m-1 border px-4 py-2 ${isSelected ? 'border-black bg-black' : 'border-zinc-200 bg-zinc-100'}`}>
    <StyledText className={`font-inter text-sm ${isSelected ? 'text-white' : 'text-zinc-700'}`}>
      {label}
    </StyledText>
  </TouchableOpacity>
);

// Reusable component for section titles
const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
  <View className="mb-4">
    <StyledText className="font-inter text-lg text-zinc-800">{title}</StyledText>
    {description && (
      <StyledText className="mt-1 font-inter text-sm text-zinc-500">{description}</StyledText>
    )}
  </View>
);

type PreferenceKey = keyof Preferences;

export default function PreferencesScreen() {
  const { userData, setUserData, handleUpdateUserData } = useOnboarding();
  const router = useRouter();

  // Local state for preferences, initialized from context
  const [preferences, setPreferences] = useState<Preferences>(userData.preferences);

  // Handler to update a specific preference field
  const updatePreference = (key: PreferenceKey, value: Preferences[PreferenceKey]) => {
    setPreferences((prev: Preferences) => ({ ...prev, [key]: value }));
  };

  const toggleListItem = (item: string, key: 'preferredLanguages' | 'interests') => {
    const list = preferences[key];
    const currentIndex = list.indexOf(item);
    const newList = [...list];
    if (currentIndex === -1) {
      newList.push(item);
    } else {
      newList.splice(currentIndex, 1);
    }
    updatePreference(key, newList);
  };

  const handleFinish = () => {
    // Update the main context
    setUserData({
      ...userData,
      preferences,
    });

    // Here you would typically make the final API call to save all onboarding data
    console.log('Final Onboarding Data:', { ...userData, preferences });

    handleUpdateUserData();

    // Navigate to the main app screen
    router.replace('/(protected)/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 py-28">
          <StyledText className="mb-2 text-center font-playfair text-3xl tracking-tighter">
            Your Preferences
          </StyledText>
          <StyledText className="mb-8 text-center font-inter text-base text-zinc-600">
            Help us find the perfect pen pal for you.
          </StyledText>

          {/* Age Range */}
          <View className="mb-8">
            <SectionHeader title="Age Range" />
            <RangeSlider
              value={[preferences.minAge, preferences.maxAge]}
              onValueChange={(value: number[] | undefined) => {
                if (!value) return;
                updatePreference('minAge', Math.round(value[0]));
                updatePreference('maxAge', Math.round(value[1]));
              }}
              minimumValue={18}
              maximumValue={99}
              step={1}
              thumbTintColor="#000000"
              minimumTrackTintColor="#333333"
              maximumTrackTintColor="#e4e4e7"
            />
            <StyledText className="mt-2 text-center font-inter text-zinc-600">
              {`${preferences.minAge} - ${preferences.maxAge} years old`}
            </StyledText>
          </View>

          {/* Max Distance */}
          <View className="mb-8">
            <SectionHeader title="Maximum Distance" />
            <Slider
              value={preferences.maxDistance}
              onValueChange={(value: number) => updatePreference('maxDistance', value)}
              minimumValue={100} // e.g., 100km
              maximumValue={20000} // e.g., 20,000km (around the world)
              step={100}
              thumbTintColor="#000000"
              minimumTrackTintColor="#333333"
              maximumTrackTintColor="#e4e4e7"
            />
            <StyledText className="mt-2 text-center font-inter text-zinc-600">
              {preferences.maxDistance < 20000
                ? `${preferences.maxDistance} km`
                : 'Anywhere in the world'}
            </StyledText>
          </View>

          {/* Gender Preference */}
          <View className="mb-8">
            <SectionHeader title="Connect With" />
            <View className="flex-row flex-wrap justify-center">
              {Object.values(Gender).map((gender) => {
                const genderValue = gender as Gender;
                return (
                  <Badge
                    key={genderValue}
                    label={genderValue.charAt(0).toUpperCase() + genderValue.slice(1)}
                    isSelected={preferences.gender === genderValue}
                    onPress={() => updatePreference('gender', genderValue)}
                  />
                );
              })}
            </View>
          </View>

          {/* Preferred Languages */}
          <View className="mb-8">
            <SectionHeader
              title="Preferred Languages"
              description="Select languages you'd like your pen pal to speak."
            />
            <View className="flex-row flex-wrap">
              {LANGUAGES.slice(0, 15).map((lang: string) => (
                <Badge
                  key={lang}
                  label={lang}
                  isSelected={preferences.preferredLanguages.includes(lang)}
                  onPress={() => toggleListItem(lang, 'preferredLanguages')}
                />
              ))}
            </View>
          </View>

          {/* Preferred Interests */}
          <View className="mb-8">
            <SectionHeader
              title="Shared Interests"
              description="Find people who love the things you love."
            />
            <View className="flex-row flex-wrap">
              {INTERESTS.slice(0, 20).map((interest: string) => (
                <Badge
                  key={interest}
                  label={interest}
                  isSelected={preferences.interests.includes(interest)}
                  onPress={() => toggleListItem(interest, 'interests')}
                />
              ))}
            </View>
          </View>

          <Button
            className="mt-4 items-center justify-center py-3"
            textClassName="text-white text-xl font-playfair-bold"
            onPress={handleFinish}
            style={{ borderRadius: 0 }}>
            Finish Onboarding
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

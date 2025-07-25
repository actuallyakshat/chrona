// app/(onboarding)/user-preferences.tsx
import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '~/components/Button';
import { StyledText } from '~/components/StyledText';
import PreferencesForm from '~/components/PreferencesForm';
import { Preferences, useOnboarding } from '~/providers/onboarding-provider';

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
    handleUpdateUserData();

    // Navigate to the main app screen
    router.replace('/(protected)/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 pb-16 pt-12">
          <StyledText className="mb-2 text-center font-playfair text-3xl tracking-tighter">
            Your Preferences
          </StyledText>
          <StyledText className="mb-8 text-center font-inter text-base text-zinc-600">
            Help us find the perfect pen pal for you.
          </StyledText>

          <PreferencesForm
            preferences={preferences}
            updatePreference={updatePreference}
            toggleListItem={toggleListItem}
          />

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

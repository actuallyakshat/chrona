// app/(modals)/adjust-preferences.tsx
import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '~/components/Button';
import { StyledText } from '~/components/StyledText';
import PreferencesForm from '~/components/PreferencesForm';
import { useMutation } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Gender, Preferences } from '~/providers/onboarding-provider';
import useUser from '~/hooks/useUser';

export default function AdjustPreferences() {
  const router = useRouter();
  const { user } = useUser();
  const updatePreferencesMutation = useMutation(api.user.updatePreferences);

  // Initialize state with user's current preferences or defaults
  const [preferences, setPreferences] = useState<Preferences>({
    minAge: user?.preferences?.minAge ?? 18,
    maxAge: user?.preferences?.maxAge ?? 50,
    maxDistance: user?.preferences?.maxDistance ?? 5000,
    gender: (user?.preferences?.gender ?? 'any') as Gender,
    preferredLanguages: user?.preferences?.preferredLanguages ?? [],
    interests: user?.preferences?.interests ?? [],
  });

  const [isSaving, setIsSaving] = useState(false);

  // Handler to update a specific preference field
  const updatePreference = (key: keyof Preferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const toggleListItem = (item: string, key: 'preferredLanguages' | 'interests') => {
    const list = preferences[key] || [];
    const currentIndex = list.indexOf(item);
    const newList = [...list];
    if (currentIndex === -1) {
      newList.push(item);
    } else {
      newList.splice(currentIndex, 1);
    }
    updatePreference(key, newList);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updatePreferencesMutation({ preferences });
      Alert.alert('Success', 'Preferences updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
      console.error('Failed to update preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 pb-16 pt-12">
          <StyledText className="mb-2 text-center font-playfair text-3xl tracking-tighter">
            Adjust Preferences
          </StyledText>
          <StyledText className="mb-8 text-center font-inter text-base text-zinc-600">
            Update your pen pal matching preferences
          </StyledText>

          <PreferencesForm
            preferences={preferences}
            updatePreference={updatePreference}
            toggleListItem={toggleListItem}
          />

          <Button
            className="mt-4 items-center justify-center py-3"
            textClassName="text-white text-xl font-playfair-bold"
            onPress={handleSave}
            disabled={isSaving}
            style={{ borderRadius: 0 }}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

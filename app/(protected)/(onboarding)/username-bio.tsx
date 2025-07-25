// @app/(protected)/(onboarding)/username-bio.tsx
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '~/components/Button';
import { StyledText } from '~/components/StyledText';
import { useOnboarding, Gender } from '~/providers/onboarding-provider';

export default function UsernameBioScreen() {
  const { userData, setUserData } = useOnboarding();
  const router = useRouter();
  const [username, setUsername] = useState(userData.username || '');
  const [bio, setBio] = useState(userData.bio || '');
  const [gender, setGender] = useState<Gender | null>(userData.gender || null);

  const handleContinue = () => {
    if (!username.trim() || !gender) return;

    setUserData({
      ...userData,
      username: username.trim(),
      bio: bio.trim(),
      gender,
    });
    router.push('/(protected)/(onboarding)/connection-preferences');
  };

  const genderOptions = [
    { label: 'Male', value: Gender.Male },
    { label: 'Female', value: Gender.Female },
    { label: 'Non-binary', value: Gender.NonBinary },
    { label: 'Prefer not to say', value: Gender.Any },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 pb-16 pt-12">
          <StyledText className="mb-2 text-center font-playfair text-3xl tracking-tighter">
            Your Profile
          </StyledText>
          <StyledText className="mb-8 text-center font-inter text-base text-zinc-600">
            Tell us about yourself
          </StyledText>

          <View className="mb-6">
            <StyledText className="mb-2 font-inter text-base text-zinc-800">Username</StyledText>
            <TextInput
              className="rounded border border-gray-300 p-3 font-inter"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
            />
          </View>

          <View className="mb-6">
            <StyledText className="mb-2 font-inter text-base text-zinc-800">Bio</StyledText>
            <TextInput
              className="rounded border border-gray-300 p-3 font-inter"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View className="mb-6">
            <StyledText className="mb-2 font-inter text-base text-zinc-800">Gender</StyledText>
            <View className="flex-row flex-wrap">
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`mb-2 mr-2 px-4 py-2 ${
                    gender === option.value ? 'bg-black' : 'bg-gray-200'
                  }`}
                  onPress={() => setGender(option.value)}>
                  <StyledText className={gender === option.value ? 'text-white' : 'text-gray-800'}>
                    {option.label}
                  </StyledText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            className="mt-4 items-center justify-center py-3"
            textClassName="text-white text-xl font-playfair-bold"
            onPress={handleContinue}
            disabled={!username.trim() || !gender}
            style={{ borderRadius: 0 }}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

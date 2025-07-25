import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '~/components/Button';
import { StyledText } from '~/components/StyledText';
import { useOnboarding } from '~/providers/onboarding-provider';
import { INTERESTS, LANGUAGES } from '~/constants/languages-and-interests-options';

// A reusable Badge component for selection
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
    className={`
      m-1 border px-4 py-2
      ${isSelected ? 'border-black bg-black' : 'border-zinc-200 bg-zinc-100'}
    `}>
    <StyledText
      className={`
        font-inter text-sm
        ${isSelected ? 'text-white' : 'text-zinc-700'}
      `}>
      {label}
    </StyledText>
  </TouchableOpacity>
);

export default function LanguagesAndInterests() {
  const { userData, setUserData } = useOnboarding();
  const router = useRouter();

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    userData.languagesSpoken || []
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userData.interests || []);

  // Generic handler to toggle selection in a list
  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    const currentIndex = list.indexOf(item);
    const newList = [...list];

    if (currentIndex === -1) {
      newList.push(item); // Add item if not present
    } else {
      newList.splice(currentIndex, 1); // Remove item if present
    }
    setList(newList);
  };

  const handleContinue = () => {
    setUserData({
      ...userData,
      languagesSpoken: selectedLanguages,
      interests: selectedInterests,
    });
    // Navigate to the next screen, e.g., preferences
    router.push('/(protected)/(onboarding)/username-bio');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 py-28">
          <StyledText className="mb-2 text-center font-playfair text-3xl tracking-tighter">
            Tell Us More
          </StyledText>
          <StyledText className="mb-8 text-center font-inter text-base text-zinc-600">
            Select the languages you speak and some of your interests.
          </StyledText>

          {/* Languages Section */}
          <View className="mb-8">
            <StyledText className="mb-3 font-inter text-lg text-zinc-800">
              Languages You Speak
            </StyledText>
            <View className="flex-row flex-wrap">
              {LANGUAGES.map((language: string) => (
                <Badge
                  key={language}
                  label={language}
                  isSelected={selectedLanguages.includes(language)}
                  onPress={() => toggleSelection(language, selectedLanguages, setSelectedLanguages)}
                />
              ))}
            </View>
          </View>

          {/* Interests Section */}
          <View className="mb-8">
            <StyledText className="mb-3 font-inter text-lg text-zinc-800">
              Your Interests
            </StyledText>
            <View className="flex-row flex-wrap">
              {INTERESTS.map((interest) => (
                <Badge
                  key={interest}
                  label={interest}
                  isSelected={selectedInterests.includes(interest)}
                  onPress={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
                />
              ))}
            </View>
          </View>

          <Button
            className="mt-4 items-center justify-center py-3"
            textClassName="text-white text-xl font-playfair-bold"
            onPress={handleContinue}
            style={{ borderRadius: 0 }}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

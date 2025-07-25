// @providers/onboarding-provider.tsx
import React, { createContext, useContext, ReactNode, useState, useRef, useEffect } from 'react';
import useUser from '~/hooks/useUser';
import { useMutation } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Alert } from 'react-native'; // Add this import

export enum Gender {
  Male = 'male',
  Female = 'female',
  NonBinary = 'non-binary',
  Any = 'any',
}

export type Preferences = {
  minAge: number;
  maxAge: number;
  maxDistance: number;
  gender: Gender;
  preferredLanguages: string[];
  interests: string[];
};

interface OnboardingUserData {
  name: string;
  imageUrl: string;
  bio: string;
  age: number;
  dateOfBirth: string;
  city: string;
  country: string;
  location: {
    latitude: number;
    longitude: number;
  };
  gender: Gender | null;
  languagesSpoken: string[];
  interests: string[];
  username: string;
  preferences: Preferences;
}

type OnboardingContextType = {
  userData: OnboardingUserData;
  setUserData: (userData: OnboardingUserData) => void;
  handleUpdateUserData: () => Promise<void>;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const { user } = useUser();
  const completeOnboardingProfile = useMutation(api.user.completeOnboardingProfile);
  const setUsername = useMutation(api.user.setUsername);

  const [userData, setUserData] = useState<OnboardingUserData>({
    age: 0,
    bio: '',
    city: '',
    country: '',
    gender: null,
    imageUrl: user?.imageUrl || '',
    interests: [],
    languagesSpoken: [],
    location: {
      latitude: 0,
      longitude: 0,
    },
    name: user?.name || '',
    dateOfBirth: '',
    username: '',
    preferences: {
      minAge: 18,
      maxAge: 99,
      maxDistance: 1000,
      gender: Gender.Any,
      preferredLanguages: [],
      interests: [],
    },
  });

  const userDataRef = useRef<OnboardingUserData>(userData);
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  async function handleUpdateUserData() {
    const dataToUpdate = userDataRef.current;
    if (!dataToUpdate) return;

    try {
      const {
        bio,
        age,
        city,
        country,
        location,
        preferences,
        gender,
        languagesSpoken,
        interests,
        dateOfBirth,
        name,
        username,
      } = dataToUpdate;

      console.log('Updating user profile in Convex:', dataToUpdate);

      // Set username first
      if (username) {
        await setUsername({ username });
      }

      // Then complete onboarding profile
      await completeOnboardingProfile({
        bio,
        gender: gender || Gender.Any,
        age,
        city,
        country,
        location,
        languagesSpoken,
        interests,
        dateOfBirth,
        name,
        preferences: {
          minAge: preferences.minAge,
          maxAge: preferences.maxAge,
          maxDistance: preferences.maxDistance,
          gender: preferences.gender,
          preferredLanguages: preferences.preferredLanguages,
          interests: preferences.interests,
        },
      });

      setUserData(dataToUpdate);
    } catch (error: any) {
      console.error('Failed to update user profile in Convex:', error);

      // Show alert dialog with error message
      Alert.alert('Update Failed', error.message || 'Failed to update profile. Please try again.', [
        { text: 'OK' },
      ]);

      throw error; // Re-throw to allow caller to handle if needed
    }
  }

  return (
    <OnboardingContext.Provider value={{ userData, setUserData, handleUpdateUserData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

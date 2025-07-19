import React, { createContext, useContext, ReactNode, useState, useRef, useEffect } from 'react';
import useUser from '~/hooks/useUser';
import { useMutation } from 'convex/react';
import { api } from '~/convex/_generated/api'; // Assuming this path to your generated API

// --- Enums and Interfaces (as provided in your original code) ---
export enum Gender {
  Male = 'male',
  Female = 'female',
  NonBinary = 'non-binary',
  Any = 'any',
}

export interface Preferences {
  minAge: number;
  maxAge: number;
  maxDistance: number; // in km
  gender: Gender | null;
  preferredLanguages: string[];
  interests: string[];
  // Assuming preferredCountries might be added later, currently optional in Convex args
  // preferredCountries?: string[];
}

interface OnboardingUserData {
  name: string;
  imageUrl: string;
  bio: string;
  age: number;
  dateOfBirth: string; // Added this as per your original userData structure
  city: string;
  country: string;

  location: {
    latitude: number;
    longitude: number;
  };

  gender: Gender | null; // This is the user's *own* gender, not preference

  languagesSpoken: string[];
  interests: string[];

  preferences: Preferences;
}

// --- Context Type ---
type OnboardingContextType = {
  userData: OnboardingUserData;
  setUserData: (userData: OnboardingUserData) => void;
  handleUpdateUserData: () => Promise<void>;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// --- OnboardingProvider Component ---
export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const { user } = useUser();
  // Initialize the Convex mutation
  const completeOnboardingProfile = useMutation(api.user.completeOnboardingProfile);

  const [userData, setUserData] = useState<OnboardingUserData>({
    // Initialize with default values or values from `useUser`
    age: 0,
    bio: '',
    city: '',
    country: '',
    gender: null, // User's own gender, not a preference initially
    imageUrl: user?.imageUrl || '',
    interests: [], // User's own interests
    languagesSpoken: [], // User's own languages
    location: {
      latitude: 0,
      longitude: 0,
    },
    name: user?.name || '',
    dateOfBirth: user?.dateOfBirth || '',

    // Pen Pal Preferences (default values)
    preferences: {
      minAge: 18,
      maxAge: 99,
      maxDistance: 1000, // Default to 1000 km
      gender: Gender.Any, // Default to any gender for preferences
      preferredLanguages: [],
      interests: [],
    },
  });

  // Keep the ref updated with the latest userData
  const userDataRef = useRef<OnboardingUserData>(userData);
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  /**
   * Handles updating the user's profile and preferences in the database via Convex.
   * This is called on the final step of onboarding, and always uses the latest userData from state.
   */
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
      } = dataToUpdate;
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
          gender: preferences.gender || Gender.Any,
          preferredLanguages: preferences.preferredLanguages,
          interests: preferences.interests,
        },
      });
      console.log('User profile updated successfully via Convex!');
      setUserData(dataToUpdate); // Update local state after successful API call
    } catch (error) {
      console.error('Failed to update user profile in Convex:', error);
      throw error;
    }
  }

  return (
    <OnboardingContext.Provider value={{ userData, setUserData, handleUpdateUserData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

// --- useOnboarding Hook ---
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

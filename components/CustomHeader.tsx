// components/CustomHeader.tsx
import React from 'react';
import { View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { StyledText } from './StyledText';
import colors from '~/constants/colors';

interface CustomHeaderProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

export default function CustomHeader({ onMenuPress, onProfilePress }: CustomHeaderProps) {
  const { user } = useUser();

  // Use Clerk user data if available, fallback to props
  const userImage = user?.imageUrl;

  return (
    <SafeAreaView className="pb-5" style={{ backgroundColor: colors.background }}>
      <View
        style={{ elevation: 1 }}
        className="flex-row items-center justify-between border-b px-5 py-2.5">
        <StyledText className="text-3xl font-bold text-black">Chrona</StyledText>

        <TouchableOpacity onPress={onProfilePress} className="p-1">
          <View className="size-12 items-center justify-center overflow-hidden rounded-full">
            {userImage ? (
              <Image
                source={{ uri: userImage }}
                className="h-full w-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <StyledText className="text-base">👤</StyledText>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

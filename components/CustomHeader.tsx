// components/CustomHeader.tsx
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname, useRouter } from 'expo-router';
import { Image, SafeAreaView, TouchableOpacity, View } from 'react-native';
import colors from '~/constants/colors';
import { useHeader } from '~/providers/header-provider';
import { StyledText } from './StyledText';

interface CustomHeaderProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

const PageToHeaderTitleMapping: Record<string, string> = {
  '/': 'Chrona',
  '/connections': 'Connections',
  '/profile': 'Profile',
  '/discover': 'Discover',
};

export default function CustomHeader({ onMenuPress, onProfilePress }: CustomHeaderProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { headerState } = useHeader();

  const cleanPath = pathname.split('?')[0].split('#')[0];

  // True only when we are on /connections/<something>
  const isChronicleDetail = cleanPath.startsWith('/connections/') && cleanPath !== '/connections';

  const pageTitle = isChronicleDetail
    ? headerState.title
    : (PageToHeaderTitleMapping[cleanPath] ?? 'Chrona');

  function handleBack() {
    router.replace('/connections');
  }

  return (
    <SafeAreaView className="pb-5" style={{ backgroundColor: colors.background }}>
      <View
        style={{ elevation: 1 }}
        className="flex-row items-center justify-between border-b-[0.5px] px-5 py-2.5">
        <View className="flex-row items-center">
          {isChronicleDetail ? (
            <View className="flex-row items-center p-1">
              <TouchableOpacity onPress={handleBack} className="mr-4">
                <Ionicons name="chevron-back" size={28} color={colors.foreground} />
              </TouchableOpacity>
              <Image
                source={{ uri: headerState.imageUrl ?? user?.imageUrl }}
                className="mr-4 size-12 rounded-full"
                resizeMode="cover"
              />
            </View>
          ) : null}
          <StyledText className="text-3xl font-bold text-black">{pageTitle}</StyledText>
        </View>

        {!isChronicleDetail && (
          <TouchableOpacity onPress={onProfilePress} className="p-1">
            <View className="size-12 items-center justify-center overflow-hidden rounded-full">
              {user?.imageUrl ? (
                <Link href="/profile">
                  <Image
                    source={{ uri: user.imageUrl }}
                    className="h-full w-full rounded-full"
                    resizeMode="cover"
                  />
                </Link>
              ) : (
                <StyledText className="text-base">👤</StyledText>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

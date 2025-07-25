import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
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

/* ---------- hard-coded right-hand components ---------- */
const HardCodedRight = ({ pathname }: { pathname: string }) => {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useAuth();

  switch (pathname) {
    case '/':
      return user?.imageUrl ? (
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image
            source={{ uri: user.imageUrl }}
            className="size-10 rounded-full"
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null;

    case '/connections':
      return (
        <Link href="/(protected)/(modals)/search-user-by-username" asChild>
          <TouchableOpacity className="rounded-md  px-4 py-2">
            <StyledText className="font-playfair font-semibold text-black">
              <Ionicons name="add" size={24} color="#000" />
            </StyledText>
          </TouchableOpacity>
        </Link>
      );

    case '/discover':
      return (
        <Link href="/(protected)/(modals)/adjust-preferences" asChild>
          <TouchableOpacity className="rounded-md  px-4 py-2">
            <StyledText className="font-playfair font-semibold text-black">
              <Ionicons name="settings-outline" size={24} color="#000" />
            </StyledText>
          </TouchableOpacity>
        </Link>
      );

    case '/profile':
      return (
        <TouchableOpacity
          onPress={async () => {
            await signOut();
            router.replace('/signin');
          }}
          className="rounded-md px-4 py-2">
          <StyledText className="font-playfair text-red-600">Logout</StyledText>
        </TouchableOpacity>
      );

    default:
      return null;
  }
};

export default function CustomHeader({ onMenuPress, onProfilePress }: CustomHeaderProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const segments = useSegments();
  const router = useRouter();
  const { headerState } = useHeader();

  const [activePathname, setActivePathname] = useState(pathname);

  useEffect(() => {
    const isModal = (segments as string[]).includes('(modals)');
    if (!isModal) setActivePathname(pathname);
  }, [pathname, segments]);

  const cleanPath = activePathname.split('?')[0].split('#')[0];
  const isChronicleDetail = cleanPath.startsWith('/connections/') && cleanPath !== '/connections';

  const pageTitle = isChronicleDetail
    ? headerState?.title || 'User Profile'
    : (PageToHeaderTitleMapping[cleanPath] ?? 'Chrona');

  function handleBack() {
    router.replace('/connections');
  }

  const handleProfilePress = () => {
    if (isChronicleDetail && headerState?.userId) {
      router.push(`/connections/${headerState.userId}`);
    }
  };

  /* Decide what to render on the right */
  const rightElement =
    headerState.rightComponent !== undefined
      ? headerState.rightComponent /* provider override */
      : !isChronicleDetail && <HardCodedRight pathname={cleanPath} />;

  return (
    <SafeAreaView className="pb-5" style={{ backgroundColor: colors.background }}>
      <View
        style={{ elevation: 1 }}
        className="flex-row items-center justify-between border-b-[0.5px] px-5 py-2.5">
        {/* Left side */}
        <View className="flex-row items-center">
          {isChronicleDetail ? (
            <>
              <TouchableOpacity onPress={handleBack} className="mr-4 p-1">
                <Ionicons name="chevron-back" size={28} color={colors.foreground} />
              </TouchableOpacity>

              <Link
                href={{
                  pathname: '/profile-preview',
                  params: { id: headerState?.userId ?? user?.id },
                }}
                asChild>
                <TouchableOpacity className="flex-row items-center">
                  <Image
                    source={{ uri: headerState?.imageUrl ?? user?.imageUrl }}
                    className="mr-4 size-12 rounded-full"
                    resizeMode="cover"
                  />
                  <StyledText className="text-2xl font-bold text-black">{pageTitle}</StyledText>
                </TouchableOpacity>
              </Link>
            </>
          ) : (
            <TouchableOpacity onPress={handleProfilePress} className="flex-row items-center">
              <StyledText className="text-3xl font-bold text-black">{pageTitle}</StyledText>
            </TouchableOpacity>
          )}
        </View>

        {/* Right side */}
        <View className="flex-row items-center">{rightElement}</View>
      </View>
    </SafeAreaView>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { INTERESTS, LANGUAGES } from '~/constants/languages-and-interests-options';
import { api } from '~/convex/_generated/api';
import useUser from '~/hooks/useUser';

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  interests: z.array(z.string()).optional(),
  languagesSpoken: z.array(z.string()).optional(),
});

type ProfileForm = z.infer<typeof ProfileSchema>;

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
    className={`m-1 border px-4 py-2 ${
      isSelected ? 'border-black bg-black' : 'border-black bg-white'
    }`}>
    <Text className={`font-inter text-sm ${isSelected ? 'text-white' : 'text-zinc-700'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function ProfilePage() {
  const { user } = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const updateProfile = useMutation(api.user.updateProfile);

  const [imageUri, setImageUri] = useState<string | null>(user?.imageUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState, setValue, watch } = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      bio: user?.bio ?? '',
      interests: user?.interests ?? [],
      languagesSpoken: user?.languagesSpoken ?? [],
    },
  });

  const watchedFields = watch();

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('bio', user.bio ?? '');
      setValue('interests', user.interests ?? []);
      setValue('languagesSpoken', user.languagesSpoken ?? []);
      setImageUri(user.imageUrl ?? null);
    }
  }, [user, setValue]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async (data: ProfileForm) => {
    if (!user) return;
    setIsSubmitting(true);

    let storageId: string | null = null;

    try {
      // Handle image upload - check if it's a new local image
      if (imageUri && imageUri !== user.imageUrl && imageUri.startsWith('file://')) {
        setIsUploading(true);

        // Generate upload URL
        const postUrl = await generateUploadUrl();

        // Fetch the local image
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Upload to Convex storage
        const uploadResponse = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': blob.type },
          body: blob,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const result = await uploadResponse.json();
        storageId = result.storageId;
      }

      // Update profile with new data
      await updateProfile({
        ...data,
        storageId: storageId || undefined,
      });

      // Optionally navigate back or show success message
      // router.back();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  const isChanged =
    (watchedFields.name !== user?.name ||
      watchedFields.bio !== user?.bio ||
      imageUri !== user?.imageUrl ||
      JSON.stringify(watchedFields.interests) !== JSON.stringify(user?.interests) ||
      JSON.stringify(watchedFields.languagesSpoken) !== JSON.stringify(user?.languagesSpoken)) &&
    formState.isValid;

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <ScrollView contentContainerClassName="p-6">
        <View className="items-center">
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: imageUri ?? undefined }}
              className="h-32 w-32 rounded-full bg-zinc-200"
            />
            <Text className="mt-2 text-center text-black">Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8 gap-y-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-black bg-white p-4"
                placeholder="Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {formState.errors.name && (
            <Text className="text-red-500">{formState.errors.name.message}</Text>
          )}

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="h-32 border bg-white p-4 align-top"
                placeholder="Bio"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
              />
            )}
          />

          <View>
            <Text className="mb-2 text-lg font-semibold">Interests</Text>
            <Controller
              control={control}
              name="interests"
              render={({ field: { value, onChange } }) => (
                <View className="flex-row flex-wrap">
                  {INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      label={interest}
                      isSelected={value?.includes(interest) ?? false}
                      onPress={() => {
                        const newValue = value?.includes(interest)
                          ? value.filter((i) => i !== interest)
                          : [...(value ?? []), interest];
                        onChange(newValue);
                      }}
                    />
                  ))}
                </View>
              )}
            />
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold">Languages Spoken</Text>
            <Controller
              control={control}
              name="languagesSpoken"
              render={({ field: { value, onChange } }) => (
                <View className="flex-row flex-wrap">
                  {LANGUAGES.map((language) => (
                    <Badge
                      key={language}
                      label={language}
                      isSelected={value?.includes(language) ?? false}
                      onPress={() => {
                        const newValue = value?.includes(language)
                          ? value.filter((l) => l !== language)
                          : [...(value ?? []), language];
                        onChange(newValue);
                      }}
                    />
                  ))}
                </View>
              )}
            />
          </View>
        </View>
        <Button
          onPress={handleSubmit(handleSave)}
          disabled={!isChanged || isSubmitting || isUploading}
          className={`mt-8 py-4 ${!isChanged || isSubmitting || isUploading ? 'bg-zinc-400' : 'bg-black'}`}
          textClassName="text-center text-white font-bold">
          Save Changes
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

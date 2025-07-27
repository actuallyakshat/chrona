// app/connections/[id].tsx
import { useAuth } from '@clerk/clerk-expo';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useHeader } from '~/providers/header-provider';
import { getDeliveryInfo } from '~/utils/deliveryTime';
// import { BlurView } from 'expo-blur';
import { BlurView } from '@react-native-community/blur';
const MIN_WORDS = 50;

export default function ConnectionDetailsPage() {
  const { id: connectionId, name, imageUrl, fresh, recipientUserId } = useLocalSearchParams();
  const { setHeaderState } = useHeader();
  const { userId: currentUserId } = useAuth();
  const router = useRouter();
  const me = useQuery(api.user.getCurrentUser);

  // Mutations
  const createConnection = useMutation(api.connection.createConnection);
  const sendChronicle = useMutation(api.chronicle.sendChronicle);

  // Only fetch connection details if not fresh
  const data = useQuery(
    api.connection.getConnectionWithChronicles,
    fresh === 'true' ? 'skip' : { id: connectionId as Id<'connection'> }
  );

  useEffect(() => {
    if (name && imageUrl) {
      setHeaderState({
        title: name as string,
        imageUrl: (imageUrl as string) || undefined,
        userId: recipientUserId as string,
      });
    }
  }, [connectionId, name, imageUrl, setHeaderState, recipientUserId]);

  // Message input state
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate word count
  const wordCount = useMemo(() => {
    const count = message
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    return count;
  }, [message]);

  const isMessageValid = wordCount >= MIN_WORDS && message.trim().length > 0;

  // Memoize sorted chronicles
  const chronicles = useMemo(() => {
    if (!data?.chronicles) {
      return [];
    }
    const sorted = [...data.chronicles].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
    return sorted;
  }, [data]);

  // Send message handler
  const handleSend = async () => {
    if (!isMessageValid) {
      Alert.alert(
        'Message Too Short',
        `Please write at least ${MIN_WORDS} words to send a meaningful message. Current: ${wordCount} words.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!currentUserId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);

    try {
      if (fresh === 'true') {
        if (!recipientUserId) {
          Alert.alert('Error', 'Recipient user ID is required');
          return;
        }

        const currentUserIdString = currentUserId as Id<'user'>;
        const recipientUserIdString = recipientUserId as Id<'user'>;

        const pairKey = [currentUserIdString, recipientUserIdString].sort().join('-');
        const delayInHours = 24;

        const newConnectionId = await createConnection({
          firstUserClerkId: currentUserIdString,
          secondUserClerkId: recipientUserIdString as string,
          pairKey,
          delayInHours,
          firstChronicle: {
            senderClerkId: currentUserIdString,
            receiverClerkId: recipientUserIdString as string,
            content: message,
            sentAt: new Date().toISOString(),
          },
        });

        setMessage('');

        router.replace({
          pathname: '/connections/[id]',
          params: {
            id: newConnectionId,
            name,
            imageUrl,
            fresh: 'false',
          },
        });

        Alert.alert(
          'Success',
          'Your chronicle has been sent! It will be delivered based on the distance between you and your recipient.'
        );
      } else {
        await sendChronicle({
          connectionId: connectionId as Id<'connection'>,
          content: message,
        });

        setMessage('');
        Alert.alert('Success', 'Your chronicle has been sent!');
      }
    } catch (error) {
      console.error('[ConnectionDetailsPage] Error sending message:', error);
      Alert.alert('Error', 'Failed to send your chronicle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If fresh, show a UI for establishing a new connection
  if (fresh === 'true') {
    return (
      <KeyboardAvoidingView
        className="flex-1 "
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <View className="flex-1">
          {/* Header Section */}
          <View className="border-b border-black px-6 py-8">
            <Text className="text-2xl font-bold text-black">New Connection</Text>
            <Text className="mt-2 text-lg text-black">{name}</Text>
            <Text className="mt-4 text-base text-gray-700">
              Your first chronicle to {name}. Take your time and write something meaningful.
            </Text>
          </View>

          {/* Message Input */}
          <View className="flex-1 p-6">
            <View className="flex-1">
              <Text className="mb-3 text-sm font-medium text-black">
                Compose Your Chronicle ({wordCount}/{MIN_WORDS} words minimum)
              </Text>
              <TextInput
                className="flex-1 border border-black  p-4 text-base text-black"
                value={message}
                onChangeText={setMessage}
                placeholder={`Write at least ${MIN_WORDS} words to create a meaningful connection...`}
                placeholderTextColor="#666"
                multiline
                textAlignVertical="top"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
              />

              {/* Word count indicator */}
              <View className="mt-3 flex-row justify-between">
                <Text
                  className={`text-sm ${wordCount >= MIN_WORDS ? 'text-green-600' : 'text-red-600'}`}>
                  {wordCount < MIN_WORDS
                    ? `${MIN_WORDS - wordCount} more words needed`
                    : `Ready to send (${wordCount} words)`}
                </Text>
              </View>
            </View>

            {/* Send Button */}
            <Pressable
              className={`mt-6 border p-4 ${
                isMessageValid && !isLoading
                  ? 'border-black bg-black'
                  : 'border-gray-300 bg-gray-100'
              }`}
              onPress={handleSend}
              disabled={!isMessageValid || isLoading}>
              <Text
                className={`text-center font-playfair-medium text-lg font-bold ${
                  isMessageValid && !isLoading ? 'text-white' : 'text-gray-400'
                }`}>
                {isLoading ? 'Sending Chronicle...' : 'Send Chronicle'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Normal chat UI
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>
      <View className="flex-1">
        {/* Messages List */}
        <FlatList
          data={chronicles}
          keyExtractor={(item) => {
            return item._id;
          }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSender = item.sender === me?._id;
            const delayInHours = data?.connection?.delayInHours ?? 0;
            const delivery = getDeliveryInfo(item, delayInHours);
            const shouldBlur = !delivery.delivered && !isSender;

            const displayContent = item.content;

            return (
              <View
                className={`mb-6 max-w-[85%] border-[0.7px] border-black p-4 ${
                  isSender ? 'self-end bg-black' : 'self-start bg-white'
                } overflow-hidden`} // overflow-hidden to clip blur
                style={{ position: 'relative' }}>
                {/* 1. Render the content (message + status) */}
                <View>
                  <Text
                    className={`font-inter text-base leading-6 tracking-tighter ${
                      isSender ? 'text-white' : 'text-black'
                    }`}
                    style={{ minHeight: 24 }}>
                    {displayContent}
                  </Text>
                  <Text className={`mt-3 text-xs ${isSender ? 'text-gray-300' : 'text-gray-500'}`}>
                    {delivery.delivered
                      ? `Delivered • ${new Date(item.sentAt).toLocaleDateString()}`
                      : `In Transit • Arrives in ${delivery.timeLeft}`}
                  </Text>
                </View>

                {/* 2. Blur overlay */}
                {shouldBlur && (
                  <BlurView
                    style={StyleSheet.absoluteFillObject}
                    blurType="light"
                    blurAmount={3}
                    reducedTransparencyFallbackColor="white"
                  />
                )}

                {/* 3. Render the status text again, absolutely positioned at the bottom */}
                {shouldBlur && (
                  <View
                    style={{
                      position: 'absolute',
                      left: 16, // match your padding
                      right: 16,
                      bottom: 12, // match your margin/padding
                    }}
                    pointerEvents="none" // so it doesn't block touches
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSender ? 'text-gray-300' : 'text-gray-500'
                      }`}
                      style={{
                        textShadowColor: 'rgba(255,255,255,0.7)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                      {`In Transit • Arrives in ${delivery.timeLeft}`}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
        />

        {/* Message Input Area */}
        {me && data ? (
          (() => {
            // Find the last message and its delivery info
            const lastChronicle = chronicles.length > 0 ? chronicles[chronicles.length - 1] : null;
            const lastDelivery = lastChronicle
              ? getDeliveryInfo(lastChronicle, data?.connection?.delayInHours ?? 0)
              : null;
            const isLastFromMe = lastChronicle?.sender === me?._id;
            const isLastPendingFromOther =
              lastChronicle && !isLastFromMe && lastDelivery && !lastDelivery.delivered;

            if (isLastFromMe) {
              return (
                <View className="border-t-[0.6px] border-black bg-white p-6 text-center">
                  <Text className="font-playfair text-base tracking-tighter text-gray-600">
                    Meaningful conversation is a two-way street. Wait for {name} to reply before
                    sending another chronicle.
                  </Text>
                </View>
              );
            }

            if (isLastPendingFromOther) {
              return (
                <View className="border-t-[0.6px] border-black bg-white p-6 text-center">
                  <Text className="font-playfair text-base tracking-tighter text-gray-600">
                    {name}&apos;s chronicle is on its journey to you. Let&apos;s wait for their
                    message to arrive before you respond.
                  </Text>
                </View>
              );
            }

            // Otherwise, show the input area
            return (
              <View className="border-t-[0.7px] border-black bg-white p-4">
                <Text className="mb-2 font-playfair text-sm font-medium text-black">
                  Write Your Reply ({wordCount}/{MIN_WORDS} words minimum)
                </Text>
                <View className="mb-3">
                  <TextInput
                    className="min-h-[100px] border-[0.7px] border-black bg-white p-3 text-base text-black"
                    value={message}
                    onChangeText={setMessage}
                    placeholder={`Take your time and write at least ${MIN_WORDS} meaningful words...`}
                    placeholderTextColor="#666"
                    multiline
                    textAlignVertical="top"
                    style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                  />
                </View>
                {/* Controls Row */}
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm ${
                      wordCount >= MIN_WORDS ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {wordCount < MIN_WORDS
                      ? `${MIN_WORDS - wordCount} more words needed`
                      : `Ready to send (${wordCount} words)`}
                  </Text>
                  <Pressable
                    className={`border px-6 py-2 ${
                      isMessageValid && !isLoading
                        ? 'border-black bg-black'
                        : 'border-gray-300 bg-gray-100'
                    }`}
                    onPress={handleSend}
                    disabled={!isMessageValid || isLoading}>
                    <Text
                      className={`font-playfair ${
                        isMessageValid && !isLoading ? 'text-white' : 'text-gray-400'
                      }`}>
                      {isLoading ? 'Sending...' : 'Send Chronicle'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })()
        ) : (
          <Fragment />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

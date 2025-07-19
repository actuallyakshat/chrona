import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '~/components/Button';
import { StyledText } from '~/components/StyledText';
import { useOnboarding } from '~/providers/onboarding-provider';

// For date picking, use @react-native-community/datetimepicker if available
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'none',
  returnKeyType = 'done',
  editable = true,
  textColorClass = '',
  ...rest
}: {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  editable?: boolean;
  textColorClass?: string;
  [key: string]: any;
}) {
  return (
    <View>
      <StyledText className="mb-1.5 font-inter text-zinc-700">{label}</StyledText>
      <View
        className={`border border-zinc-200 bg-zinc-50 px-4 py-3 ${editable ? '' : 'border-zinc-100 bg-zinc-100'}`}
        style={{ borderRadius: 0 }}>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          className={textColorClass}
          {...rest}
        />
      </View>
    </View>
  );
}

// Helper to calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

export default function PersonalDetails() {
  const { userData, setUserData } = useOnboarding();
  const router = useRouter();

  const [name, setName] = useState(userData.name);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    userData.dateOfBirth ? new Date(userData.dateOfBirth) : null
  );
  const [tempDate, setTempDate] = useState<Date | null>(dateOfBirth || new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      if (userData.age) {
        const today = new Date();
        const estimatedDOB = new Date(
          today.getFullYear() - userData.age,
          today.getMonth(),
          today.getDate()
        );
        setDateOfBirth(estimatedDOB);
        setTempDate(estimatedDOB);
      }
    }
  }, [userData]);

  const openDatePicker = () => {
    setTempDate(dateOfBirth || new Date(2000, 0, 1));
    setShowDatePicker(true);
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDateConfirm = () => {
    if (tempDate) {
      setDateOfBirth(tempDate);
    }
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!dateOfBirth) {
      setError('Date of birth is required.');
      return;
    }
    if (!userData) {
      setError('User data not loaded. Please try again.');
      return;
    }
    const age = calculateAge(dateOfBirth);
    if (age < 0 || age > 120) {
      setError('Please enter a valid date of birth.');
      return;
    }

    // Update onboarding context
    setUserData({
      ...userData,
      name,
      dateOfBirth: dateOfBirth.toISOString(),
      age,
    });

    router.push('/location-details');
  };

  if (userData === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 justify-center px-6 pb-12">
        <StyledText className="mb-2 text-center font-playfair text-3xl tracking-tighter">
          Personal Details
        </StyledText>
        <StyledText className="mb-8 text-center font-inter text-base text-zinc-600">
          Please enter your full name and date of birth.
        </StyledText>
        <View className="gap-5">
          <FormField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            autoCapitalize="words"
            returnKeyType="done"
          />
          <View>
            <StyledText className="mb-1.5 font-inter text-zinc-700">Date of Birth</StyledText>
            <TouchableOpacity
              onPress={openDatePicker}
              activeOpacity={0.7}
              style={{
                borderWidth: 1,
                borderColor: '#e4e4e7',
                backgroundColor: '#fafafa',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 0,
              }}>
              <StyledText
                className={`font-inter ${dateOfBirth ? 'text-zinc-900' : 'text-zinc-400'}`}>
                {dateOfBirth ? dateOfBirth.toLocaleDateString() : 'Select your date of birth'}
              </StyledText>
            </TouchableOpacity>
            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
              onRequestClose={handleDateCancel}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    padding: 16,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}>
                  <DateTimePicker
                    value={tempDate || new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    style={{ width: '100%' }}
                  />
                  <View className="mt-4 flex-row justify-end pb-4 pr-2">
                    <TouchableOpacity onPress={handleDateCancel} className="mr-5">
                      <StyledText className="font-inter text-lg text-zinc-500">Cancel</StyledText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDateConfirm}>
                      <StyledText className="font-inter text-lg text-blue-600">Confirm</StyledText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
          {dateOfBirth && (
            <StyledText className="mt-1 font-inter text-zinc-500">
              Age: {calculateAge(dateOfBirth)}
            </StyledText>
          )}
        </View>
        {error && (
          <StyledText className="mt-4 text-center font-inter text-red-500">{error}</StyledText>
        )}
        <Button
          className="mt-8 items-center justify-center py-3 disabled:opacity-40"
          textClassName="text-white text-xl font-playfair-bold"
          onPress={handleSave}
          disabled={!dateOfBirth || !name || !name.trim()}
          style={{ borderRadius: 0 }}>
          Continue
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

import { Modal, View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/constants/colors';
import { UnitSystem, ozToMl } from '@/types';

interface CustomAmountSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (amountMl: number) => void;
  unit: UnitSystem;
}

const SUGGESTIONS = [100, 200, 350, 500];

export default function CustomAmountSheet({ visible, onClose, onAdd, unit }: CustomAmountSheetProps) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const num = parseInt(value, 10);
    if (num > 0) {
      const ml = unit === 'oz' ? ozToMl(num) : num;
      onAdd(ml);
      setValue('');
    }
  };

  const handleSuggestion = (amount: number) => {
    setValue(String(amount));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>Custom amount</Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={`Enter amount (${unit})`}
            placeholderTextColor={Colors.textMuted}
            keyboardType="number-pad"
            style={styles.input}
            autoFocus
            accessibilityLabel={`Enter custom amount in ${unit === 'ml' ? 'milliliters' : 'ounces'}`}
          />

          <View style={styles.suggestions}>
            {SUGGESTIONS.map((amount) => (
              <Pressable
                key={amount}
                onPress={() => handleSuggestion(amount)}
                style={styles.suggestion}
                accessibilityLabel={`${amount} ${unit}`}
                accessibilityRole="button"
              >
                <Text style={styles.suggestionText}>{amount}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleAdd}
            style={[styles.addButton, !value && styles.addButtonDisabled]}
            accessibilityLabel="Add drink"
            accessibilityRole="button"
            disabled={!value}
          >
            <Text style={styles.addButtonText}>Add Drink</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 25, 41, 0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ringTrack,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ringTrack,
    paddingHorizontal: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    textAlign: 'right',
  },
  suggestions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  suggestion: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: Colors.surfaceDivider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 52,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
});

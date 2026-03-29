import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Droplets, Coffee, CupSoda, Citrus, Milk, Beer, FlaskRound, Wine,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHydrationStore } from '@/store/hydration-store';

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  droplets: Droplets,
  coffee: Coffee,
  'cup-soda': CupSoda,
  citrus: Citrus,
  milk: Milk,
  beer: Beer,
  'flask-round': FlaskRound,
  wine: Wine,
};

interface BeveragePickerProps {
  visible: boolean;
  onClose: () => void;
}

export default function BeveragePicker({ visible, onClose }: BeveragePickerProps) {
  const { beverageTypes, selectedBeverageId, selectBeverage } = useHydrationStore();

  const handleSelect = (id: string) => {
    selectBeverage(id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>Choose a beverage</Text>

          <View style={styles.grid}>
            {beverageTypes.filter((b) => b.isPreset).map((beverage) => {
              const Icon = ICON_MAP[beverage.icon] ?? Droplets;
              const isSelected = beverage.id === selectedBeverageId;
              return (
                <Pressable
                  key={beverage.id}
                  onPress={() => handleSelect(beverage.id)}
                  style={[styles.item, isSelected && styles.itemSelected]}
                  accessibilityLabel={`${beverage.name}, hydration ${Math.round(beverage.hydrationMultiplier * 100)}%`}
                  accessibilityRole="button"
                >
                  <Icon size={28} color={isSelected ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>
                    {beverage.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {(() => {
            const selected = beverageTypes.find((b) => b.id === selectedBeverageId);
            if (selected && selected.hydrationMultiplier < 1) {
              return (
                <Text style={styles.multiplierNote}>
                  Counts as {Math.round(selected.hydrationMultiplier * 100)}% of volume
                </Text>
              );
            }
            return null;
          })()}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.ringTrack,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 72,
    minHeight: 72,
  },
  itemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  itemLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 0.33,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  itemLabelSelected: {
    color: Colors.primary,
  },
  multiplierNote: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 16,
    letterSpacing: 0.33,
    textTransform: 'uppercase',
    lineHeight: 16,
    textAlign: 'center',
  },
});

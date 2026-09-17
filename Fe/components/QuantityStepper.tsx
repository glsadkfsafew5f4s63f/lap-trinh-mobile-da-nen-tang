import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../constants/theme';

type Props = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

export function QuantityStepper({ quantity, onIncrease, onDecrease }: Props) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.btn} onPress={onDecrease}>
        <Ionicons name="remove" size={16} color={colors.ink} />
      </Pressable>
      <Text style={styles.qty}>{quantity}</Text>
      <Pressable style={styles.btn} onPress={onIncrease}>
        <Ionicons name="add" size={16} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.full,
    padding: 4,
    alignSelf: 'flex-start',
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    minWidth: 28,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    color: colors.ink,
  },
});

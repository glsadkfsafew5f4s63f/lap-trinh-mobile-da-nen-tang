import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../constants/theme';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function FilterChip({ label, active, onPress }: Props) {
  return (
    <Pressable style={[styles.chip, active && styles.active]} onPress={onPress}>
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginRight: 8,
    marginBottom: 8,
  },
  active: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  text: {
    fontSize: 13,
    color: colors.ink,
  },
  activeText: {
    color: '#fff',
    fontWeight: '700',
  },
});

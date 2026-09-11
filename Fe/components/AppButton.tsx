import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'fill' | 'outline' | 'soft';
};

export function AppButton({ label, onPress, variant = 'fill' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        variant === 'fill' && styles.fill,
        variant === 'outline' && styles.outline,
        variant === 'soft' && styles.soft,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'fill' && styles.fillText,
          variant === 'outline' && styles.outlineText,
          variant === 'soft' && styles.softText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  fill: {
    backgroundColor: colors.ink,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: 'transparent',
  },
  soft: {
    backgroundColor: colors.accentSoft,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  fillText: {
    color: '#fff',
  },
  outlineText: {
    color: colors.ink,
  },
  softText: {
    color: colors.accent,
  },
});

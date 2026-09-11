import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
};

export function SectionHeader({ title, subtitle, onSeeAll }: Props) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll}>
          <Text style={styles.link}>Xem tất cả</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
  link: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '700',
  },
});

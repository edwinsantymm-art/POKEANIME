import { View, StyleSheet } from 'react-native';

export default function PokeballIcon({ size = 28 }: { size?: number }) {
  const centerSize = size * 0.34;

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.topHalf, { height: size / 2 - 1 }]} />
      <View style={styles.line} />
      <View
        style={[
          styles.center,
          {
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
            top: size / 2 - centerSize / 2,
            left: size / 2 - centerSize / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    borderColor: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  topHalf: {
    backgroundColor: '#E43AA8',
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: '#1A1A1A',
  },
  center: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
});

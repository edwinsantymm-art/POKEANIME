import { View, Text, StyleSheet } from 'react-native';
import { coloresJJK } from '@/styles/colors';

export default function JJKHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>呪</Text>
        </View>
        <Text style={styles.title}>Jujutsu Kaisen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: coloresJJK.rojo,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: coloresJJK.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: coloresJJK.rojo,
    fontWeight: '800',
    fontSize: 16,
  },
  title: {
    color: coloresJJK.blanco,
    fontSize: 20,
    fontWeight: '700',
  },
});

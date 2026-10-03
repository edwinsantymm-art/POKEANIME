import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import PokeballIcon from './PokeballIcon';

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <PokeballIcon size={30} />
        <Text style={styles.title}>Pokédex</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>B</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.morado,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  title: {
    color: colors.blanco,
    fontSize: 22,
    fontWeight: '700',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.rosa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.blanco,
    fontWeight: '700',
    fontSize: 15,
  },
});

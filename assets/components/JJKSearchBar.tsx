import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { coloresJJK } from '@/styles/colors';
import { useJujutsu } from '@/context/JujutsuContext';

export default function JJKSearchBar() {
  const { searchText, setSearchText, handleSearch } = useJujutsu();

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={coloresJJK.rojo} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Nombre o número del personaje"
        placeholderTextColor="#B08A8A"
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <Pressable style={styles.button} onPress={handleSearch} accessibilityLabel="Buscar personaje">
        <Ionicons name="arrow-forward" size={18} color={coloresJJK.blanco} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: -18,
    backgroundColor: coloresJJK.blanco,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    color: coloresJJK.texto,
    paddingVertical: 2,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: coloresJJK.rojo,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

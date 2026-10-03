import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/styles/colors';
import { usePokemon } from '@/context/PokemonContext';

export default function SearchBar() {
  const { searchText, setSearchText, handleSearch } = usePokemon();

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.morado} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Nombre o número del Pokémon"
        placeholderTextColor="#9AA0B4"
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <Pressable style={styles.button} onPress={handleSearch} accessibilityLabel="Buscar Pokémon">
        <Ionicons name="arrow-forward" size={18} color={colors.blanco} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: -18,
    backgroundColor: colors.blanco,
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
    color: colors.texto,
    paddingVertical: 2,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.rosa,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

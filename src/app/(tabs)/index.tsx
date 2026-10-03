import { ScrollView, View, StyleSheet } from 'react-native';
import Header from '@/assets/components/Header';
import SearchBar from '@/assets/components/SearchBar';
import PokemonCard from '@/assets/components/PokemonCard';
import ActionButtons from '@/assets/components/ActionButtons';
import { colors } from '@/styles/colors';

export default function Index() {
  return (
    <View style={styles.container}>
      <Header />
      <SearchBar />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PokemonCard />
        <ActionButtons />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
});

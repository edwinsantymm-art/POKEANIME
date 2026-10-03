import { ScrollView, View, StyleSheet } from 'react-native';
import JJKHeader from '@/assets/components/JJKHeader';
import JJKSearchBar from '@/assets/components/JJKSearchBar';
import JJKCharacterCard from '@/assets/components/JJKCharacterCard';
import JJKActionButtons from '@/assets/components/JJKActionButtons';
import { coloresJJK } from '@/styles/colors';

export default function JujutsuScreen() {
  return (
    <View style={styles.container}>
      <JJKHeader />
      <JJKSearchBar />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <JJKCharacterCard />
        <JJKActionButtons />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: coloresJJK.fondo,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
});

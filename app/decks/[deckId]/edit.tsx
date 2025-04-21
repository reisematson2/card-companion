import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EditDeckRedirect() {
  const { deckId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof deckId === 'string') {
      router.replace({
        pathname: '../deck-builder',
        params: { deckId },
      });
    }
  }, [deckId]);

  return null;
}

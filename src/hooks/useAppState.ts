import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useAppState(onForeground: () => void, onBackground?: () => void) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        onForeground();
      }
      if (nextState === 'background' || nextState === 'inactive') {
        onBackground?.();
      }
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [onForeground, onBackground]);
}

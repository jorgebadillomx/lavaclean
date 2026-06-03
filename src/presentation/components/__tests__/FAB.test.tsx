import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FAB } from '../FAB';
import { Colors, Rounded } from '../../theme/tokens';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, bottom: 34, right: 0 },
};

function renderFAB(props: React.ComponentProps<typeof FAB>) {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <FAB {...props} />
    </SafeAreaProvider>
  );
}

describe('FAB', () => {
  it('renders with the expected size and accent color', () => {
    const { getByRole } = renderFAB({ onPress: () => {}, accessibilityLabel: 'Crear nota' });

    const button = getByRole('button');
    const style = StyleSheet.flatten(button.props.style);

    expect(style).toMatchObject({
      width: 56,
      height: 56,
      borderRadius: Rounded.full,
      backgroundColor: Colors.accentFab,
      position: 'absolute',
      right: 16,
    });
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();

    const { getByRole } = renderFAB({ onPress, accessibilityLabel: 'Crear nota' });

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

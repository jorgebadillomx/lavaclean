import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { PrimaryButton } from '../PrimaryButton';
import { Colors, Spacing } from '../../theme/tokens';

describe('PrimaryButton', () => {
  it('renders with the expected touch target height', () => {
    const { getByRole } = render(
      <PrimaryButton label="Cobrar" onPress={() => {}} />
    );

    const button = getByRole('button');
    const style = StyleSheet.flatten(button.props.style);

    expect(style).toMatchObject({
      height: Spacing.touchPreferred,
      backgroundColor: Colors.primary,
    });
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();

    const { getByRole } = render(
      <PrimaryButton label="Cobrar" onPress={onPress} />
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();

    const { getByRole } = render(
      <PrimaryButton label="Cobrar" onPress={onPress} disabled />
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });
});

import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { CounterButton } from '../CounterButton';
import { Rounded } from '../../theme/tokens';

describe('CounterButton', () => {
  it('renders the expected compact size and triggers callbacks', () => {
    const onIncrement = jest.fn();
    const onDecrement = jest.fn();

    const { getByRole, getByText } = render(
      <CounterButton
        value={2}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        accessibilityLabel="lavados de camisa"
      />
    );

    const decrementButton = getByRole('button', {
      name: 'Disminuir lavados de camisa',
    });
    const incrementButton = getByRole('button', {
      name: 'Incrementar lavados de camisa',
    });
    const value = getByText('2');

    expect(StyleSheet.flatten(decrementButton.props.style)).toMatchObject({
      width: 40,
      height: 40,
      borderRadius: Rounded.full,
    });
    expect(StyleSheet.flatten(incrementButton.props.style)).toMatchObject({
      width: 40,
      height: 40,
      borderRadius: Rounded.full,
    });
    expect(StyleSheet.flatten(value.props.style)).toMatchObject({ fontSize: 18 });

    fireEvent.press(decrementButton);
    fireEvent.press(incrementButton);

    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });
});

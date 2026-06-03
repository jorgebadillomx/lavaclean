import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Tag } from '../Tag';
import { Colors } from '../../theme/tokens';

describe('Tag', () => {
  it('renders the provided label and colors', () => {
    const { getByText } = render(
      <Tag
        label="Efectivo"
        backgroundColor={Colors.tagCash}
        inkColor={Colors.tagCashInk}
      />
    );

    const label = getByText('Efectivo');
    const containerStyle = StyleSheet.flatten(label.parent?.parent?.props.style);
    const textStyle = StyleSheet.flatten(label.props.style);

    expect(containerStyle).toMatchObject({
      backgroundColor: Colors.tagCash,
      borderRadius: 4,
    });
    expect(textStyle).toMatchObject({ color: Colors.tagCashInk });
  });
});

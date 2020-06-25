import React from 'react';
import { Text } from 'react-native';

export default ({style, state}) => (
        <Text style={style}>
            {state.texte}
        </Text>
);
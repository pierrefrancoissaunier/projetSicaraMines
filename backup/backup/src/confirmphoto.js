import React from 'react'
import styles from './styles'
import { View, Image } from 'react-native'


export default class ConfirmPhoto extends React.Component {

    static navigationOptions = {
        headerShown: false // pas de titre sur la caméra (pas utile pour l'instant, on utilise pas Navigation)
      };
      
    render() {
        const item = this.props.navigation.state.params.item
        return(
            <View>
            <Image source={item} style={styles.preview}></Image>
            </View>
        );
    };
};
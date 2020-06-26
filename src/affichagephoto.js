import React from 'react'
import { ImageBackground, View, Text } from 'react-native'


export default class AffichePhotoGallery extends React.Component {
    static navigationOptions = {
        headerShown: false // pas de titre sur cette vue
    }; 

    render() {
        const item = this.props.navigation.state.params.item
        return(
            <ImageBackground source={item.uri} style={{flex: 1}}>
                <View
                style={{
                    marginTop: 20, backgroundColor:'white',
                    alignSelf: 'center', marginTop:20, padding:5,
                    backgroundColor:'white', borderRadius:10,
                    borderWidth: 1}}>
                <Text>
                    Label : {item.label}
                </Text>
                </View>
            </ImageBackground>           
        )
    }
}
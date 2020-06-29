import React from 'react'
import { ImageBackground, View, Text } from 'react-native'


export default class AffichePhotoGallery extends React.Component {
    static navigationOptions = {
        headerShown: false // pas de titre sur cette vue
    }; 

    item = this.props.navigation.state.params.item

    render() {
        return(
            <ImageBackground source={this.item.uri} style={{flex: 1}}>
                <View
                style={{
                    marginTop: 20, backgroundColor:'red',
                    alignSelf: 'center', marginTop:20, padding:5,
                    backgroundColor:'white', borderRadius:10,
                    borderWidth: 1}}>
                <Text>
                    Label : {this.item.label}
                </Text>
                </View>
            </ImageBackground>           
        )
    }
}
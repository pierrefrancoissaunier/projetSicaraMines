import React from 'react';
import { Image, TouchableOpacity, Text, Button } from 'react-native';
import styles from './styles';
import { FlatList } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default class Gallerie extends React.Component {
    
    static navigationOptions = {
        headerShown: false
    };

    captures = this.props.navigation.state.params.captures.reverse()
    
    render() {

        return(
            <React.Fragment>
                <Text style={{marginTop:20}}></Text>
                <FlatList
                data={this.captures}
                renderItem={
                    ({item}) =>

                        <TouchableOpacity
                        style={styles.galleryImageContainer}
                        onPress={() => this.props.navigation.navigate('AffichePhotoGallery', {item: item})}>
                            <Image source={item} style={styles.galleryImage} />      
                        </TouchableOpacity>
                }
                keyExtractor={(item) => item.toString()} // à l'uri on associe luimeme comme key pour pas d'erreur jaune
                numColumns={4}
                />
            </React.Fragment>

        )
    }

}
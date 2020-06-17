import React from 'react';
import { View, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import styles from './styles';
import { FlatList } from 'react-native-gesture-handler';

export default class Gallerie extends React.Component {
    render() {

        const captures = this.props.navigation.state.params.photos
        return(
            <React.Fragment>
            <FlatList
                    data={captures.reverse()} //reverse pour affichage avec photo ancienne en haut
                    renderItem={({item}) => (

                        // on fait un bouton pour zoomer sur l'image
                        <TouchableOpacity style={styles.galleryImageContainer}
                                        onPress={() => this.props.navigation.navigate('AffichePhotoGallery', {item: item})}>
                        <Image source={item} style={styles.galleryImage} />      
                        </TouchableOpacity>
                        )}
                    keyExtractor={(item) => item.toString()} // à l'uri on associe luimeme comme key pour pas d'erreur jaune
                    numColumns={4}
                    />
            </React.Fragment>
                





        )
    }

}
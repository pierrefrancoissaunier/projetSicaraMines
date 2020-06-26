import React from 'react';
import { Image, TouchableOpacity, Text, Button } from 'react-native';
import styles from './styles';
import { FlatList } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default class Gallerie extends React.Component {

  captures = this.props.navigation.state.params.captures.reverse()
    
  render() {

    return(
      <React.Fragment>
        <FlatList data={this.captures} numColumns={4}
        keyExtractor={(item) => item.uri.toString()} // à l'uri on associe luimeme comme key pour pas d'erreur jaune
        renderItem={({item}) =>
                
          <TouchableOpacity style={styles.galleryImageContainer}
          onPress={() => this.props.navigation.navigate('AffichePhotoGallery', {item: item})}>
            <Image source={item.uri} style={styles.galleryImage}/>      
          </TouchableOpacity>
        
        }
        />
      
      </React.Fragment>

    )
  }
}
import React from 'react';
import { Image, TouchableOpacity, Text, Button } from 'react-native';
import styles from './styles';
import { FlatList } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default class Gallerie extends React.Component {
    state = {
        modele: true
    }


    static navigationOptions = {
        headerShown: false
    };

    captures = this.props.navigation.state.params.captures.reverse()
    
    render() {

        return(
            <React.Fragment>
                {/* <TouchableOpacity
                    style={{marginTop: 30, backgroundColor:'yellow', alignItems:'center', height:30, justifyContent:'center'}}
                    onPress={() => this.setState({modele: !this.state.modele})}>
                    <Text style={{height: 20}}>
                        {this.state.modele ? 'Modèle local. Rapide mais peu précis ' : 'Mobilenet. Précis mais lent' } 
                    </Text>
                </TouchableOpacity> */}
                <Text style={{marginTop:20}}></Text>
                <Button
                title={ 'Modèle : (Cliquer pour changer)' + '\n' + 
                    (this.state.modele ?
                    'Modèle local. Rapide mais peu précis'
                    : 'Mobilenet. Précis mais lent')
                }
                onPress={() => this.setState({ modele: !this.state.modele }) } />
                <FlatList
                data={this.captures}
                renderItem={
                    ({item}) =>

                        <TouchableOpacity
                        style={styles.galleryImageContainer}
                        onPress={() => this.props.navigation.navigate('AffichePhotoGallery', {item: item, modele: this.state.modele})}>
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
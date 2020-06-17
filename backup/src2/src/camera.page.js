import React from 'react';
import { Camera } from 'expo-camera';
import { View, Text, TextInput, Button, FlatList, Image } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as tf from '@tensorflow/tfjs'

import styles from './styles';
import Toolbar from './toolbar.component';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';


export default class CameraPage extends React.Component {
    camera = null;

    static navigationOptions = {
        header: null // pas de titre sur la caméra (pas utile pour l'instant, on utilise pas Navigation)
      };
    
    state = {
        captures: [],
        capturing: null,
        hasCameraPermission: null,
        cameraType: Camera.Constants.Type.back,
        flashMode: Camera.Constants.FlashMode.off,
        
        displayGallery: false,
        
        zoomSurImage: false,
        quelleImage: null,

        isTfReady: false

    };

    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    handleCaptureOut = () => {
        if (this.state.capturing)
            this.camera.stopRecording();
    };

    handleShortCapture = async () => {
        const photoData = await this.camera.takePictureAsync();
        this.setState({ capturing: false, captures: [photoData, ...this.state.captures]})
    };

    handleLongCapture = async () => {
        const videoData = await this.camera.recordAsync();
        this.setState({ capturing: false, captures: [videoData, ...this.state.captures] });
    };

    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');
        await tf.ready()
            this.setState({isTfReady: true});

        this.setState({ hasCameraPermission });
    };

    


    render() {
        const { hasCameraPermission, flashMode, cameraType, capturing, captures } = this.state;

        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>Access to camera has been denied.</Text>;
        }





/* Affichage de la caméra (sans gallerie ni zoom photo) */
        if (!this.state.displayGallery && !this.state.zoomSurImage) {
            return (
                <React.Fragment>
                    <View>
                        <Camera
                            type={cameraType}
                            flashMode={flashMode}
                            style={styles.preview}
                            ref={camera => this.camera = camera}
                        />
                    </View> 
                    <TouchableOpacity
                    style={{marginTop:20, alignItems:'flex-end'}}
                    onPress={() => this.setState( {displayGallery: true} )}>
                        <Ionicons
                            name="md-image"
                            color="white"
                            size={60}
                        />
                    </TouchableOpacity>
                    
                    <Toolbar 
                        capturing={capturing}
                        flashMode={flashMode}
                        cameraType={cameraType}
                        setFlashMode={this.setFlashMode}
                        setCameraType={this.setCameraType}
                        onCaptureIn={this.handleCaptureIn}
                        onCaptureOut={this.handleCaptureOut}
                        onLongCapture={this.handleLongCapture}
                        onShortCapture={this.handleShortCapture}
                    />
                </React.Fragment>
        );
    }

/* Affichage de la gallerie, sans zoom photo */ 
        else if (this.state.displayGallery && !this.state.zoomSurImage){
            return (
                <React.Fragment>
                {/* Ici, un bouton pour revenir à l'affichage de la caméra */}
                <View>
                    <TouchableOpacity style={{marginTop: 20, alignItems:'flex-end'}} onPress={() => this.setState( {displayGallery: false} )}>
                        <Ionicons 
                        name="md-image"
                        color="black"
                        size={60}
                        />
                    </TouchableOpacity>
                </View>
                {/* maintenant on affiche les images, avec un bouton pour zommer dessus */}
                <FlatList
                    data={captures.reverse()} //reverse pour affichage avec photo ancienne en haut
                    renderItem={({item}) => (

                        // on fait un bouton pour zoomer sur l'image
                        <TouchableOpacity style={styles.galleryImageContainer}
                                        onPress={() => {this.setState({zoomSurImage: true, quelleImage: item} );
                                                        console.log(this.state.isTfReady)}}>
                        <Image source={item} style={styles.galleryImage} />      
                        </TouchableOpacity>
                        )}
                    keyExtractor={(item) => item.toString()} // à l'uri on associe luimeme comme key pour pas d'erreur jaune
                    numColumns={4}
                    />                
                </React.Fragment>
            )
        }
        
/* Affichage zoom photo */
        else if (this.state.zoomSurImage) {
            return(
                <View>
                <Image source={this.state.quelleImage} style={styles.preview}></Image>
                <TouchableOpacity // bouton pour revenir à la gallerie
                    style={{marginTop:20, alignItems:'flex-end'}}
                    onPress={() => this.setState( {zoomSurImage: false} )}>
                        <Ionicons
                            name="md-image"
                            color="white"
                            size={60}
                        />
                    </TouchableOpacity> 
                </View>
            )
        }
        
    };
};
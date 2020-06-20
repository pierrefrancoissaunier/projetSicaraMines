import React from 'react';
import { Camera } from 'expo-camera';
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import styles from './styles';
import Toolbar from './toolbar.component';
import GestureRecognizer from 'react-native-swipe-gestures';

export default class CameraPage extends React.Component {
    camera = null;

    static navigationOptions = {
        headerShown: false
    };
    
    state = {
        captures: [],
        lastCapture: null,
        capturing: null,
        hasCameraPermission: null,
        cameraType: Camera.Constants.Type.back,
        flashMode: Camera.Constants.FlashMode.off
    };

    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    handleCaptureOut = () => {
        if (this.state.capturing)
            this.camera.stopRecording();
    };

    confirmCapture = () => {
        this.setState({ captures: [this.state.lastCapture, ...this.state.captures], lastCapture: null });
    };
    
    handleShortCapture = async () => {
        const photoData = await this.camera.takePictureAsync();
        this.setState( { capturing: false, lastCapture: photoData } );
   }; 

    handleLongCapture = async () => {
        const videoData = await this.camera.recordAsync();
        this.setState({ capturing: false, captures: [videoData, ...this.state.captures] });
    };

    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');
        this.setState({ hasCameraPermission });

    };

    render() {
        const { hasCameraPermission, flashMode, cameraType, capturing, captures } = this.state;

        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>Access to camera has been denied.</Text>;
        }

        if (this.state.lastCapture){
            return(
                <GestureRecognizer 
                onSwipe={() => this.setState({lastCapture: null})}>
                    
                    <ImageBackground
                    source={this.state.lastCapture}
                    style={styles.preview} >
                        
                        <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={this.confirmCapture}>
                    
                            <MaterialCommunityIcons name='send' color="white" size={60} />
                        
                        </TouchableOpacity>
                    </ImageBackground>
                </GestureRecognizer>)
        }


        return (
            
            <React.Fragment>
                <GestureRecognizer onSwipeLeft={() => this.props.navigation.navigate('Gallery', {captures: captures}) }>
                    <View>                     
                        <Camera
                        type={cameraType}
                        flashMode={flashMode}
                        style={styles.preview}
                        ref={camera => this.camera = camera}>
                        </Camera>
                    </View> 

                </GestureRecognizer>
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

    };

};
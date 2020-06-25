import React from 'react';
import { Camera } from 'expo-camera';
import {
  View, Text, ImageBackground, Image, TouchableOpacity,
  ActivityIndicator, Dimensions, ScrollView, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as tf from '@tensorflow/tfjs';
import { fetch, decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as FileSystem from 'expo-file-system';

import * as jpeg from 'jpeg-js';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import styles from './styles';
import Toolbar from './toolbar.component';
import GestureRecognizer from 'react-native-swipe-gestures';
import { TextInput } from 'react-native-gesture-handler';


export default class CameraPage extends React.Component {
    
    camera = null;

    static navigationOptions = {
      headerShown: false,
    };

    modeleLocalLabels = ['airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck']

    state = {
      captures: [],
      lastCapture: null,
      capturing: null,
      hasCameraPermission: null,
      cameraType: Camera.Constants.Type.back,
      flashMode: Camera.Constants.FlashMode.off,
      areModelsReady: false,
      choix: 1
    };

    // Gestion de la caméra

    setFlashMode = (flashMode) => this.setState({ flashMode });

    setCameraType = (cameraType) => this.setState({ cameraType });

    handleCaptureIn = () => this.setState({ capturing: true });

    handleCaptureOut = () => {
      if (this.state.capturing) this.camera.stopRecording();
    };

    confirmCapture = () => {
      this.setState({ captures: [this.state.lastCapture, ...this.state.captures], lastCapture: null });
    };

    handleShortCapture = async () => {
      const photoData = await this.camera.takePictureAsync();
      this.setState({ capturing: false, lastCapture: photoData });
      this.predictionDeuxModeles();
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

      //Chargement de tensorflow, du modèle mobilenet et du modèle local
      await tf.ready();
      this.modelMobileNet = await mobilenet.load();

      const modelJson = require('../classifier_model/model.json');
      const modelWeights = require('../essai/classifier_model/group1-shard1of1.bin');
      this.localModel = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
      this.setState({ areModelsReady: true });
    }


    // Conversion de l'image pour mobilenet
    imageToTensor(rawImageData) {
      const TO_UINT8ARRAY = true;
      const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);
      const buffer = new Uint8Array(width * height * 3);
      let offset = 0;
      for (let i = 0; i < buffer.length; i += 3) {
        buffer[i] = data[offset];
        buffer[i + 1] = data[offset + 1];
        buffer[i + 2] = data[offset + 2];

        offset += 4;
      }

      return tf.tensor3d(buffer, [height, width, 3]);
    }

    // prediction mobilenet, ici on update le state avec la prediction
    classifyImageMobileNet = async () => {
      try {
        const result = await manipulateAsync(
          this.state.lastCapture.uri,
          [{ resize: { width: 640 } }],
          { compress: 1, format: SaveFormat.JPEG },
        );
        this.setState({ crop: result });
        const imageAssetPath = Image.resolveAssetSource({ uri: result.uri });
        const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
        const rawImageData = await response.arrayBuffer();
        const imageTensor = this.imageToTensor(rawImageData);
        const predictions = await this.modelMobileNet.classify(imageTensor);
        this.setState({
          pred1: predictions[0].className,
          pred2: predictions[1].className,
        });
      } catch (error) {
        console.log(error);
      }
    }

    //prediction avec le modèle local. attention,
    //la prediction n'est pas de la même forme qu'avec mobilenet
    classifyImageLocal = async () => {
      try {
        const cropUri = await manipulateAsync(
          this.state.lastCapture.uri,
          [{ resize: { width: 32, height: 32 } }],
          { compress: 1, format: SaveFormat.JPEG },
        );

        const fileUri = cropUri.uri;
        const imgB64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
        const raw = new Uint8Array(imgBuffer);
        const imageTensor = decodeJpeg(raw).expandDims();
        const predictions = (await this.localModel.predict(imageTensor).array());
        const pred = predictions[0];
        let result;
        for (let i = 0; i < pred.length; i++) {
          if (pred[i] == 1) {
            result = this.modeleLocalLabels[i];
          }
        }
        this.setState({ pred3: result });
      } catch (error) {
        console.log(error);
      }
    }



    // On fait appelle à cette fonction lorsque l'on clique sur 
    // le bouton 'prendre une photo'
    // on update donc le state avec les deux prédictions
    predictionDeuxModeles() {
      this.classifyImageMobileNet();
      this.classifyImageLocal();
    }

    // affichage de l'écran
    render() {
      const {
        hasCameraPermission, flashMode, cameraType, capturing, captures, predictionsText,
      } = this.state;
      const { width: winWidth, height: winHeight } = Dimensions.get('window');

      // si l'on n'a pas les permissions
      if (hasCameraPermission === null) {
        return <View />;
      } if (hasCameraPermission === false) {
        return <Text>Access to camera has been denied.</Text>;
      } 

      // écran de chargement
      if (!this.state.areModelsReady) {
        return (
          <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Text style={{ textAlign: 'center', height: 40 }}>Chargement des modèles ...</Text>
            <ActivityIndicator size="large" />
          </View>
        );
      }


      // this this.state.lastCapture est non vide,
      // c'est que l'on a pris une photo. C'est donc l'affichage
      // de l'écran freezé avec la possibilité de choisir une prédiction

      // On encapsule par un gestureRecognizer : si l'on swipe
      // dans nimporte quel sens, la photo prise est supprimée

      // l'image en fond est l'image prise

      // On affiche ensuite le texte de la prédiction choisie,
      // puis deux boutons : un pour afficher la préd mobilenet
      // et un pour la préd locale

      // ainsi qu'une liste pour confirmer la prédiction
      if (this.state.lastCapture) {
        
        return (
        
        <KeyboardAvoidingView behavior='padding'>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ImageBackground
          source={this.state.lastCapture}
          style={{ justifyContent:'flex-end', flexDirection:'column', alignItems: 'center', height: winHeight, width: winWidth }}
          >
            <GestureRecognizer
            onSwipe={() => this.setState({ lastCapture: null })}
            >

            </GestureRecognizer>
              <View style={{height:'20%', width:'100%', marginBottom: 35}}>
                <ScrollView contentContainerStyle={{ backgroundColor: 'white'}}>
                  


                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity style={{flex: 5}} onPress={() => this.setState({choix: 1})}>
                      <Text>Mobilenet (1): {this.state.pred1} </Text>
                    </TouchableOpacity>
                    {this.state.choix == 1 && <Text style={{flex: 1}}>✅</Text>}
                  </View>
                  
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity style={{flex: 5}} onPress={() => this.setState({choix: 2})}>
                      <Text>Mobilenet (2): {this.state.pred2}</Text>
                    </TouchableOpacity>
                    {this.state.choix == 2 && <Text style={{flex: 1}}>✅</Text>}
                  </View>
                  
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity style={{flex: 5}} onPress={() => this.setState({choix: 3})}>
                      <Text>Modèle local: {this.state.pred3}</Text>
                    </TouchableOpacity>
                    {this.state.choix == 3 && <Text style={{flex: 1}}>✅</Text>}
                  </View>

                  <View style={{flexDirection: 'row'}}>
                    <TextInput
                    style={{width: '100%'}}
                    placeholder='Ou proposez un label :'
                    autoCorrect= {false}
                    onSubmitEditing={(text) => {this.setState({ kkk: text}); console.log(text)} }/>
                  </View>
                </ScrollView>
              </View>
            
          </ImageBackground>
          </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        );
      }

      // le test lastCapture est passé, cest ici l'écran par défaut
      // ie l'écran basique de la caméra avec la toolbar
      return (

        <>
          <GestureRecognizer onSwipeLeft={() => this.props.navigation.navigate('Gallery', { captures })}>
            <View>
              <Camera
                type={cameraType}
                flashMode={flashMode}
                style={styles.preview}
                ref={(camera) => this.camera = camera}
               />
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

        </>
      );
    }
}

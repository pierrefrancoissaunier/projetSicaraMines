import React from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity,
  ActivityIndicator, Dimensions, ScrollView,
  TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import Autocomplete from 'react-native-autocomplete-input'
import { Ionicons } from '@expo/vector-icons'
import Toolbar from './toolbar.component';
import styles from './styles';

import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';

import * as tf from '@tensorflow/tfjs';
import { fetch, decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';

import * as FileSystem from 'expo-file-system';
import * as jpeg from 'jpeg-js';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';




export default class CameraPage extends React.Component {
    
  camera = null;

  static navigationOptions = {
    headerShown: false, // on n'affiche pas de titre sur cette navigation
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
    choix: 1,
    pred4: ''
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
    const modelWeights = require('../classifier_model/group1-shard1of1.bin');
    this.localModel = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
    this.setState({ areModelsReady: true });
  }
  
  
  // Gestion de la caméra
  setFlashMode = (flashMode) => this.setState({ flashMode });
  setCameraType = (cameraType) => this.setState({ cameraType });
  handleCaptureIn = () => this.setState({ capturing: true });
  handleCaptureOut = () => 
  { if (this.state.capturing) this.camera.stopRecording() };
  handleLongCapture = async () => {
    const videoData = await this.camera.recordAsync();
    this.setState({ capturing: false, captures: [videoData, ...this.state.captures] });
  };
  
  handleShortCapture = async () => {
    const photoData = await this.camera.takePictureAsync();
    this.setState({ capturing: false, lastCapture: photoData });
    this.predictionDeuxModeles();
  };



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
        [{ resize: { width:640 } }], // réduire pour accelérer la prédiction
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
  // le bouton 'prendre une photo', dans this.handleShortCapture
  // on update donc le state avec les deux prédictions
  predictionDeuxModeles() {
    this.classifyImageMobileNet();
    this.classifyImageLocal();
  }

  // lorsque l'on confirme la capture, on l'ajoute à la liste
  // avec le label correspondant au choix cliqué par l'utilisateur
  confirmCapture = () => {
    let label 
    switch(this.state.choix) {
      case 1:
        label = this.state.pred1
        break;
      case 2:
        label = this.state.pred2
        break;
      case 3:
        label = this.state.pred3
        break;
      case 4:
        label = this.state.pred4
        break;
      default:
        console.log('Erreur de confirmation')        
    }

    const new_item = { uri: this.state.lastCapture, label: label }
    
    this.setState({
      captures: [new_item, ...this.state.captures],
      lastCapture: null, pred1: null, pred2: null, pred3: null, pred4: ''
    });
  
  };

  findLabel(text) {
    if (text===''){
      return [];
    }
    const labels = this.modeleLocalLabels
    const regex = new RegExp(`${text.trim()}`, 'i');
    return labels.filter(label => label.search(regex) >= 0);
  }; 

  // affichage de l'écran
  render() {
    const { hasCameraPermission, flashMode, cameraType,
      capturing, captures, predictionsText } = this.state;
    const { width: winWidth, height: winHeight } = Dimensions.get('window');
    const labels = this.findLabel(this.state.pred4)
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
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


    // si this.state.lastCapture est non vide,
    // c'est que l'on a pris une photo. C'est donc l'affichage
    // de l'écran freezé avec la possibilité de choisir une prédiction

    // l'image en fond est l'image prise

    // On affiche ensuite le texte de la prédiction choisie,
    // puis deux boutons : un pour afficher la préd mobilenet
    // et un pour la préd locale

    // ainsi qu'une liste pour confirmer la prédiction
    if (this.state.lastCapture) {
      return (
        <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
          <ImageBackground
          source={this.state.lastCapture}
          style={{ justifyContent:'space-between', flexDirection:'column', alignItems: 'center', height: winHeight, width: winWidth }}>
            
            <View style={{marginTop: 20, height:'25%'}}>
              <ScrollView>

                {/* Prédiction MobileNet 1 */}
                <View style={{flexDirection: 'row', alignItems: 'center', height:30}}>
                  <View style={{width: '80%'}}>
                    <TouchableOpacity
                    style={styles.affichePred}
                    onPress={() => this.setState({choix: 1})}>
                      <Text style={{ backgroundColor: 'white', }}>
                        Mobilenet (1): {this.state.pred1? this.state.pred1 : '❓'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{width: '20%', justifyContent:'center', alignItems:'center'}}>
                    <Text>
                      {this.state.choix == 1 ? '✅' : ''}
                    </Text>
                  </View>
                </View>
                 {/* Prédiction MobileNet 2 */}
                <View style={{flexDirection: 'row', alignItems: 'center', height:30}}>
                  <View style={{width: '80%'}}>
                    <TouchableOpacity
                    style={styles.affichePred}
                    onPress={() => this.setState({choix: 2})}>
                      <Text style={{backgroundColor: 'white'}}>
                        Mobilenet (2): {this.state.pred2? this.state.pred2 : '❓'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{width: '20%', justifyContent:'center', alignItems:'center'}}>
                    <Text>
                      {this.state.choix == 2 ? '✅' : ''}
                    </Text>
                  </View>
                </View>

                {/* Prédiction modèle local */}
                <View style={{flexDirection: 'row', alignItems: 'center', height:30}}>
                  <View style={{width: '80%'}}>
                    <TouchableOpacity
                    style={styles.affichePred}
                    onPress={() => this.setState({choix: 3})}>
                      <Text style={{backgroundColor: 'white'}}>
                        Modèle local : {this.state.pred3}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{width: '20%', justifyContent:'center', alignItems:'center'}}>
                    <Text>
                      {this.state.choix == 3 ? '✅' : ''}
                    </Text>
                  </View>
                </View>
                
              </ScrollView>
              
              {/* Proposition de label */}
              <View style={{flexDirection: 'row', alignItems: 'center', height:30}}>
                <View style={{width: '80%'}}>
                  <Autocomplete
                    inputContainerStyle={{borderRadius: 10}}
                    data={labels.length===1 && comp(this.state.pred4, labels[0]) ? [] : labels}
                    defaultValue={this.state.pred4}
                    onChangeText={text => this.setState({pred4: text})}
                    keyExtractor={({item}) => item}
                    placeholder='Ou proposez un label :'
                    onFocus={() => this.setState({ choix: 4 })}
                    renderItem={({item}) => (
                        <TouchableOpacity onPress={() => this.setState({pred4: item})}>
                          <Text>{item}</Text>
                        </TouchableOpacity>
                    )}
                  />
                </View>
                <View style={{width: '20%', justifyContent:'center', alignItems:'center'}}>
                  <Text>
                    {this.state.choix == 4 ? '✅' : ''}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Boutons d'envoi et de suppression  */}
            <View>
              <TouchableOpacity
              onPress= { () => this.confirmCapture()}>
                <Ionicons name="ios-send" color="white" size={60} />                   
              </TouchableOpacity>

              <TouchableOpacity
              onPress= { () => this.setState({ lastCapture: null, pred1: null, pred2: null, pred4: null})}>
                <Ionicons name="ios-trash" color="white" size={30} />                   
              </TouchableOpacity>
            </View>
          
          </ImageBackground>
        </TouchableWithoutFeedback>  
      );
    }

    {/* Ici, l'écran basique de la caméra 
        avec une reconnaissance de geste pour glisser vers la gallerie */}
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
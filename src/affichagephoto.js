import React from 'react'
import styles from './styles'
import { ImageBackground, TouchableOpacity, View, Image, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as tf from '@tensorflow/tfjs'
import { fetch, decodeJpeg, bundleResourceIO} from '@tensorflow/tfjs-react-native'
import * as mobilenet from '@tensorflow-models/mobilenet'
import {loadGraphModel} from '@tensorflow/tfjs-converter';
import * as jpeg from 'jpeg-js'
import * as ImagePicker from 'expo-image-picker'
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'

import * as FileSystem from 'expo-file-system';

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';   

export default class AffichePhotoGallery extends React.Component {

    state = {
        image: {uri: this.props.navigation.state.params.item.uri},
        modele: this.props.navigation.state.params.modele, //vaut true pour local
        isTfReady: false,
        isModelReady: false,
        predictions: null
    }


    modeleLocalLabels = ["airplane","automobile","bird","cat","deer","dog","frog","horse","ship","truck"]


    static navigationOptions = {
        headerShown: false // pas de titre sur la caméra (pas utile pour l'instant, on utilise pas Navigation)
    }; 
    
    async componentDidMount() {
        console.log('debut')
        
        await tf.ready()

        if (!this.state.modele) {
            this.model = await mobilenet.load()
            this.setState({ isModelReady: true })
    }
        
        
        else {
            modelJson = require('C:/Users/User/essai/classifier_model/model.json');
            modelWeights = require('C:/Users/User/essai/classifier_model/group1-shard1of1.bin');
            this.localModel = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
            this.setState({ isModelReady: true })
        }
        
    }


    // Pour utiliser MobileNet, les trois fonctions suivantes.
    imageToTensor(rawImageData) {
        const TO_UINT8ARRAY = true
        const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
        // Drop the alpha channel info for mobilenet
        const buffer = new Uint8Array(width * height * 3)
        console.log(width, height)
        let offset = 0 // offset into original data
        for (let i = 0; i < buffer.length; i += 3) {
          buffer[i] = data[offset]
          buffer[i + 1] = data[offset + 1]
          buffer[i + 2] = data[offset + 2]
    
          offset += 4
        }
    
        return tf.tensor3d(buffer, [height, width, 3])
    }



    
    classifyImage = async () => {
        try {
            const imageAssetPath = Image.resolveAssetSource(this.state.image)
            const response = await fetch(imageAssetPath.uri, {}, { isBinary: true })
            const rawImageData = await response.arrayBuffer()
            const imageTensor = this.imageToTensor(rawImageData)
            const predictions = await this.model.classify(imageTensor)
            this.standardizePredictionsMobileNet(predictions)
            console.log(predictions)
            
        } catch (error) {
            console.log(error)
        }
    }

    standardizePredictionsMobileNet(predictions){
        this.setState({ predictions : 
            'MobileNet détecte : ' + predictions[0].className + "\n" +
            'Ou alors : ' + predictions[1].className })
    }


    // Pour utiliser le modèle interne

    classifyImageLocal = async () => {
        try{
            const result = await manipulateAsync(
                this.state.image.uri,
                [{ resize: { width: 32, height: 32 } }],
                { compress: 1, format: SaveFormat.JPEG },
            );
            
            const fileUri = result.uri;  
            const imgB64 = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
            const raw = new Uint8Array(imgBuffer)  
            const imageTensor = decodeJpeg(raw).expandDims();
            const predictions = (await this.localModel.predict(imageTensor).array());
            this.standardizePredictionsLocal(predictions[0])
        }   
         catch (error) {
            console.log(error)
        }
    }

    standardizePredictionsLocal(predictions){
        let result
        for (let i = 0; i < predictions.length; i++ ) {
            if ( predictions[i] == 1 ){
                result = 'Le modèle local détecte : ' + this.modeleLocalLabels[i]
            }
        }
        this.setState({ predictions: result })
    }

    render() {
        const item = this.props.navigation.state.params.item
        const { isTfReady, isModelReady, predictions, image } = this.state

        if (!predictions){
            return(
                <ImageBackground source={item} style={styles.preview}>
                    
                    {isModelReady    ? // test ternaire pas facile à lire 
                    
                    <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress= { () => { this.classifyImageLocal() }}>
                        <Ionicons name="ios-send" color="white" size={60} />                   
                    </TouchableOpacity>
                    :<Text style={{marginTop:400, backgroundColor:'white'}}>Loading</Text>}
                
                </ImageBackground>           
            )
        }
        return(
            <ImageBackground source={image} style={{flex: 1}}>
                <Text style={{marginTop: 25, backgroundColor: 'white'}}> 
                    {predictions}
                </Text>
            </ImageBackground>           
        )
    }
}
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
        isTfReady: false,
        isModelReady: false,
        predictions: null
    }


    static navigationOptions = {
        headerShown: false // pas de titre sur la caméra (pas utile pour l'instant, on utilise pas Navigation)
    }; 
    
    async componentDidMount() {
        console.log('debut')
        
        await tf.ready()
        this.setState({ isTfReady: true })
        console.log(this.state.isTfReady);
        this.model = await mobilenet.load()
        this.setState({ isModelReady: true })
        console.log(this.state.isModelReady);
        modelJson = require('C:/Users/User/essai/classifier_model/model.json');
        modelWeights = require('C:/Users/User/essai/classifier_model/group1-shard1of1.bin');
        this.localModel = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
        console.log('model local chargé')
    }

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
            this.setState({ predictions })
            console.log(predictions)
            
        } catch (error) {
            console.log(error)
        }
    }


    classifyImageLocal = async () => {
        try{
            const result = await manipulateAsync(
                this.state.image.uri,
                [{ resize: { width: 32, height: 32 } }],
                { compress: 1, format: SaveFormat.JPEG }
            );
            const fileUri = result.uri;
            console.log('originale', this.state.image.uri);
            console.log('RESIZED', fileUri);     
            const imgB64 = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
            const raw = new Uint8Array(imgBuffer)  
            const imageTensor = decodeJpeg(raw);
            const imageTensor2 = imageTensor.expandDims();
        

        // const uri = this.state.image;
        // const response = await fetch(uri, {}, { isBinary: true });
        // const imageData = await response.arrayBuffer();
        // const imageTensor = decodeJpeg(imageData);

        const predictions = (await this.localModel.predict(imageTensor2));
        // this.setState({ predictions });
        console.log('predictions', predictions)
        }   
         catch (error) {
            console.log(error)
        }
    }

    render() {
        const item = this.props.navigation.state.params.item
        const { isTfReady, isModelReady, predictions, image } = this.state

        if (!predictions){
            return(
                <ImageBackground source={item} style={styles.preview}>
                    {(isTfReady && isModelReady) ? 
                    <TouchableOpacity style={styles.confirmButton} onPress={ () => {
                        this.classifyImageLocal();
                        console.log("this.state.imageLOL",this.state.image) }}>
                        <Ionicons name="ios-send" color="white" size={60} />
                    </TouchableOpacity>
                    : <Text style={styles.confirmButton}>CHARGEMENT</Text>}
                </ImageBackground>           
            )
        }
        return(
            <ImageBackground source={item} style={styles.preview}>
                <Text style={{marginTop: 20}}> 
                    Plus probable : {predictions[0].className} {"\n"}
                    Ou alors : {predictions[1].className}, {"\n"} {predictions[2].className}
                </Text>
                <TouchableOpacity style={styles.confirmButton} onPress={ () => {
                    this.classifyImage();
                    }}>
                     <Ionicons name="ios-send" color="white" size={60}/>
                </TouchableOpacity>
            </ImageBackground>           
        )
    }
}
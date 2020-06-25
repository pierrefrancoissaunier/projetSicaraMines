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
    static navigationOptions = {
        headerShown: false // pas de titre sur la caméra (pas utile pour l'instant, on utilise pas Navigation)
    }; 

    render() {
        const item = this.props.navigation.state.params.item
        return(
            <ImageBackground source={item} style={{flex: 1}}/>           
        )
    }
}
import { StyleSheet, Dimensions } from 'react-native';

const { width: winWidth, height: winHeight } = Dimensions.get('window');

export default StyleSheet.create({
    alignCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    preview: {
        alignItems: 'center', //dernière modif faite pour le bouton confirmation
        height: winHeight,
        width: winWidth,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
    
    bottomToolbar: {
        width: winWidth,
        position: 'absolute',
        height: 100,
        bottom: 0,
    },

    confirmButton: {
        width: winWidth/4,
        alignItems: 'center',
        position: 'absolute',
        height: 100,
        bottom: 0,
        color: '#f0f',
    },

    captureBtn: {
        width: 60,
        height: 60,
        borderWidth: 2,
        borderRadius: 60,
        borderColor: "#FFFFFF",
    },
    captureBtnActive: {
        width: 80,
        height: 80,
    },
    captureBtnInternal: {
        width: 76,
        height: 76,
        borderWidth: 2,
        borderRadius: 76,
        backgroundColor: "red",
        borderColor: "transparent",
    },
    galleryContainer: { 
        bottom: 100 
    },
    galleryImageContainer: { 
        width: 75, 
        height: 75, 
        marginRight: 5 
    },
    galleryImage: { 
        width: 75, 
        height: 75 
    },

    zoomImage: {
        height: winHeight,
        width: winWidth,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
    predictionWrapper: {
        height: 100,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
    },
});
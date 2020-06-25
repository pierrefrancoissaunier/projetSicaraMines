import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer } from 'react-navigation' 
import CameraPage from '../src/camera.page'
import Gallerie from '../src/gallery.component'
import AffichePhotoGallery from '../src/affichagephoto'
import Validation from '../src/validate_prediction'



const CameraStackNavigator = createStackNavigator({
    
    CameraPage: {
        screen: CameraPage
    },

    Gallery: {
        screen: Gallerie
    },
    
    AffichePhotoGallery: {
        screen: AffichePhotoGallery
    },

    Validation: {
        screen: Validation
    },
    
})



export default createAppContainer(CameraStackNavigator)
import React from 'react';
import { View, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import styles from './styles';
import { FlatList } from 'react-native-gesture-handler';


/*export default ({captures=[]}) => (
    <ScrollView>
        {captures.map(({ uri }) => (
            <View style={styles.galleryImageContainer} key={uri}>
                <Image source={{ uri }} style={styles.galleryImage} />
            </View>
        ))}
    </ScrollView>
);*/

/* en fait captures contient des "liens" uri, et dans scrollview on affiche donc le rendu de chacun de ces
uri, c'est pour ca que l'on map captures selon une fonction qui a chaqu uri affiche l'image correspondante.

Dans ce que je fais ci-dessous, la fonction renderItem prend donc un item de captures, et l'affiche tout
simplement : component Image dont la source est directement itel, car item est un uri cest a dire le lien
direct vers l'image (j'essayais par exemple item.uri, ce qui n'avait par conséquent pas de sens)*/

export default ({captures=[]}) => (
    <FlatList
            
            data={captures.reverse()} //reverse pour affichage avec photo ancienne en haut
            
            renderItem={({item}) => (
            
                <View style={styles.galleryImageContainer}>
            
                    <Image source={item} style={styles.galleryImage} />
            
                </View>
            )}
            keyExtractor={(item) => item.toString()} // à l'uri on associe luimeme comme key pour pas d'erreur jaune
            numColumns={4}
      />
);
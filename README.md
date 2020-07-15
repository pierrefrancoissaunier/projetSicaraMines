# ProjetSicaraMines
Voici le code du projet informatique du groupe n°3, pour Clément Walter (Sicara)

Composé par Julien Horsin, Clémentine Vannier, Yannis Cattan, Pierre-François Saunier.

Le repository Git contient l'ensemble des dossiers nécessaires à faire tourner l'application via un serveur local Expo. En particulier, tous les packages installés via Node.js sont sauvegardés dans le répertoire. Par conséquent, il n'est pas pertinent de lire le dossier nommé "node-modules" par exemple.

Les dossiers important sont :   
  - Le coeur de l'application : le dossier ./src , dont les fichiers sont les composants de l'application. C'est notamment le fichier ./src/camera.page.js qui contient le plus gros du code, avec toute la partie de traitement des images. Les autres fichiers du dossier sont par exemple la gallerie photo.
  
  - Le store Redux est stocké dans le dossier ./Store . C'est là que l'on arrive à ajouter à une liste "détachée" des components un label proposé par l'utilisateur. Il ne contient qu'un seul reducer, assez simple, mais cela permet de comprendre le fonctionnement.
  
  - Le dossier ./Serveur contient l'implémentation du serveur local Django qui nous permet de récupérer sur l'ordinateur les photos prises via l'application.
  
  - Le dossier ./classifier_model continent un fichier python correspondant à quelques simples lignes de code construisant un modèle de prédiction d'images.
  
  - L'application se lance à la lecture du fichier ./App.js
  
  - La navigation entre les différentes pages est configurée avec ./Navigation

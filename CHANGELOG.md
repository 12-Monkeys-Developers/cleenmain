
# Version 1.1.2
- Support du module DiceSoNice
- icone pour dépense des points d'héroisme

# Version 1.1.2
- Bug sur la prise en compte des bonus / malus aux jets de défense

# Version 1.1.1
- Bug de chemin d'accès

# Version 1.1.0
## Fonctionnalités
- Jets de mort et d'inconscience (lorsqu'un PJ tombe à 0 PV)
- Adaptation du combat tracker au système CEM
- Création de macros dans la hotbar pour les acteurs, les articles et les armes

## Corrections
- Bugs d'affichage des images
- Chemin d'accès au template rollDialog.html
# Version 1.0.0
Release du système

## Fonctionnalités

- Fiche de personnage
  - Mode Protégé ou Editable : en mode protégé, seuls la vitalité, l'héroïsme et les blessures sont modifiables

- Jets de dés
  - Possibilité d'ajouter un modifcateur fixe négatif ou positif de type : +2 ou -3
  - Infobulle sur les résultats des dés

- Drag'n Drop : les zones d'arrivées possibles sont
  - Les tableaux des armes et protections pour les objets de type Arme ou Armure
  - Le tableau des armes pour les objets de type Compétence
  - La page des atouts pour les objets de type Atout

- Compétences
  - Gestion dynamique des compétences
  - Prise en compte des attributs Développé (pour l'expérience) et Physique (pour la formation aux armures)
  - L'affichage en mode Protégé affiche la valeur finale de la compétence

- Héroïsme
  - Maximum en fonction du nombre de joueuses et joueurs
  - Prise en compte de Développé
  - Affichage dans le jet de dialogue des combats si le nombre de points est suffisant
  - Diminution automatique si un point d'hérîsme est utilisé

- Vitalité : prise en compte du malus si Mal en point (joueur à 0 en vitalité)

- Onglet Combat :
    
  - Protections
    - Affichage de la valeur totale de la protection entre parenthèse, avec prise en compte du bouclier
    - Au même niveau, affichage d'un nombre positif ou négatif qui indique le nombre de jets de défense où il y aura un bonus ou un malus de +2
    - Prise en compte des formations aux armures

  -	Armes
    - Choix de la compétence liée à l'arme par un drag 'n drop d'une compétence de la liste sur l'arme en mode Edition
    - Bonus aux dégâts en fonction du type d'arme
    - Prise en compte des formations pour la fenêtre de dialogue avec l'affectation automatique de primes ou de pénalités
    - Gestion des armes 6+ avec les dés de dégâts explosifs
  - Primes : Toutes les primes sont gérées
  - Pénalités : toutes les pénalités sont gérées sauf Risque qui reste à la discrétion du MJ
  - Jet d'attaque avec les dégâts combinés qui réutilisent les D6 de l'attaque
  - Jet de dégâts uniquement
		
- Onglet Atouts : possibilité de créer un atout manuellement en mode Edition, ou de faire glisser un objet de type Atout dans n'importe quel mode. La zone d'arrivée contient le titre et les atouts déjà présents.
- Onglet Equipement
- Onglet Biographie : Champ éditable accessible uniquement en mode Edition
- Onglet Notes : Champ éditable accessible même en mode Protégé

- Options du système :
  - Nombre de joueuses et joueurs : utilisé pour le calcul du maximum d'héroisme et pour les points de vie des PNJs
  - Règles avancées : permet d'activer les options uniquement disponibles dans les règles avancées

### Règles avancées
- Gestion de l'attribut Elite des PNJs : modifie les PVs, caractéristiques et compétences
- Ajout de la prime Rapidité et la pénalité Lenteur


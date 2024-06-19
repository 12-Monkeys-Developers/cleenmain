# Version 2.7
- Debug Compatibilité Foundry v12 (relances).
# Version 2.6
- Modification compatibilité Foundry v12.
# Version 2.5.4
- Option pour la visibilité des jets de dés du MJ.
# Version 2.5.3
- Compatibilité Foundry v.11
# Version 2.5.2
- bug: malus sur pénalité Danger
- Bug: Armes lourdes / de guerre maniées par des PNJs
- Bug: Prise en compte du modificateur aux dégâts manuel pour les PNJs
# Version 2.5.1
- Ajout d'une option pour la gestion par points d'expérience (#38)
- Tri alphabétique de l'équipement (#39)
# Version 2.5.0
- Ajout d'un nouveau type d'acteur "Véhicule"
# Version 2.4.2
- Correction sur un message d'erreur côté joueur au démarrage d'un combat
- Ajout d'un compteur anonyme de monde actif
# Version 2.4.1
- Correction d'un bug sur les jets d'attaque des PNJs
# Version 2.4.0
- Mécanique des points biotech pour World War Korea
- Suppression de l'affichage du champ malus sur l'item de type armure, le malus étant calculé automatiquement selon la catégorie
- Sur l'onglet Combat, le malus de l'armure affiché est calculé selon la catégorie de l'armure et les formations de personnage
- Correction de bugs mineurs
- Correction du bug sur la prise en compte du malus d'armure même quand l'armure n'est pas équipée
- Correction de l'édition de l'armure depuis l'onglet Combat

# Version 2.3.0
- Extension et debug de la fonctionnalité de relance
- Gestion des blessures et de l'état Mal en point pour les Boss
- Correction de bugs mineurs

# Version 2.2.1
- Correction de la relance pour les PNJs

# Version 2.2.0
- Correction du bug de la création de macro dans la hotbar : plus de double macros (celle du système et celle générique)
- Ajout des effets des atouts pour les PNJs
- Gestion de la relance pour les jets de compétence, les jets d'attaque et de dommages
- Dans l'inventaire, ajout du clic sur l'objet pour afficher la description
- Divers correctifs

# Version 2.1.0
- Automatisation de certains atouts
- les armes peuvent donner un bonus aux jets de compétence
- Amélioration de la modularité
- Les PnJs font des jets cachés
- Corrections de bugs

# Version 2.0.0
- Mise à jour pour la version 10 de Foundry
- cliquer sur le portrait d'un PNJ permet de le montrer à tous les joueurs.

# Version 1.1.4
- Déplacement du repository

# Version 1.1.3
- Support du module DiceSoNice
- Icone pour dépense des points d'héroisme

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


---
layout: post
title: Mix-it, à fond sur l'accélérateur
author: feugy
tags: [conference, mix-it, agile, echec, test, tdd, lean, mongodb, nodejs, scalabilit]
---

Jeudi 26 avril 2012 : c'est reparti pour Mix-it, deuxième édition (indice : ne se prononcer pas "mixit" ou "mixaieti").

<img height="250px" src="http://www.mix-it.fr/public/resources/mixit-banner.png"/>

Des locaux plus grands à SUP-info Lyon, 5 salles pour accueillir près de 400 participants, 10 partenaires, 34 speakers pour 25 conférences 5 ateliers et 10 micro confs (lightning talks), dont la majorité filmée et retransmise en live sur un [site web](http://www.mix-it.f) flambant neuf et très pratique, une appli Android et une collection de badges honorifiques à gagner...

Bref, quasiment deux fois plus grand que la première édition en 2011 (cf mon [post](http://pullrequest.org/2011/04/19/mix-it-un-depart-sur-les-chapeaux-de-roues.html)), et une ouverture internationale avec 8 conférences en anglais et des speakers de renom.


C'est en soi déjà un succès, et les organisateurs ont annoncé l'édition 2013.
Alors, est-ce que ça valait le coup de remettre 30€ pour cette journée ? -- voici ma journée (et ce que j'ai retenu, __caution__ !), je vous laisse juges :)

## KeyNotes de Martin Görner (Google) & Claire Blondel

Après les présentation d'usage, Martin Görner nous annonce l'arrivée de Chrome sur Androïd et ses _merveilleuses fonctionnalités_ : changement d'onglet en gigotant d'un air stupide (très important l'air stupide) son téléphone et débogage distant depuis son PC (ca c'est vraiment utile).


Bref.


Heureusement Claire blondel est venu relever le niveau avec sa conférence [l'éducation positive](http://tedxtalks.ted.com/video/TEDxLyon-Claire-Blondel-Lduca-2), proposée au tedEx Lyon en novembre dernier.

En quelques mots : l'éduction française classique (école, parents) nous à sclérosé vis à vis des échecs. Il est inconcevable, inacceptable, interdit de se tromper. 
Cela induit une bonne dose d'intolérance, une mauvaise estime de soi, un manque d'autonomie et de persévérance dans les situations délicates et surtout cela restreint considérablement la prise de risque.
 
> "Le succès, c'est d'aller d'échecs en échecs sans perdre son enthousiasme" (W. Churchill). 

La prochaine fois que j'aurai à faire une revue de code, ou simplement aider un collègue, j'essaierai d'être moins psychorigide face à l'erreur.


## Pieter Hintjens (ZeroMQ) : Social architecture 101 

Rien à voir avec les réseaux sociaux, ni avec les architectures logicielles. Ah mince. 

Mais j'ai bien fait de rester, car Pieter parle de l'organisation du travail, et de son manque d'efficacité, de sa rigidité, de son côté castrateur lorsqu'il s'agit d'innover.

Après plusieurs expériences de manager et d'entrepreneur, il nous livre ses recettes pour éviter la complexité, favoriser l'auto-organisation, supprimer les frictions et dépasser les limitations individuelles.


## Emmanuel Levi-Valensi : Lean Startup

Appliquer les principes du Lean à l'entreprenariat, et particulièrement aux start-up. Telle est l'idée de Steeve Blank promue par [Eric Ries](http://en.wikipedia.org/wiki/Eric_Ries).
Pourquoi faire ? Ne pas gaspiller les fonds âprement négociés, et ne pas planter la boite au 6 mois après la première release. Des exemples ? drop-box. [Plus d'infos ici](http://theleanstartup.com/)

La boucle Plan-Do-Check-Act de Lean se décline vis à vis du produit ou de service de votre société : 
1. Partir à la découverte des besoins du client avec un produit minimal (Minimum Viable Product)
2. Valider la taille de votre marché (toujours avec votre produit, et on itère un certain nombre de fois avec l'étape 1).
3. Créer de la demande avec des features
4. Développer votre business et votre société

Deuxième principe : faire des cycles courts, pour éviter de voir s'écrouler tout l'édifice de son service parce qu'une hypothèse de base se révèle infondée

Troisième principe : faire un "vrai" Minimum Viable Product. Pas une version codée à l'arrache du produit final. L'idée du MVP c'est d'engager une boucle "Build-Measure-Learn" à moindre coût

Quatrième principe : aller sur le terrain obtenir des faits. Cela nécessite donc des mécanismes pour récolter et mesurer le feedback des utilisateurs


## Les lightning talks

10 sessions de 5 minutes. Très éclectique, très intéressant.

1. La voie du développeur (software craftsmanship)
1. Coffee script (un langage orienté classe au dessus du Js)
1. MongoDB (solution NoSQL orientée documents)
1. Le turnover dans les entreprises
1. Developper Experience (comment les fédérer autour de votre service)
1. Système à propriété dynamique (la dénormalisation d'un schéma BDD et ses avantages)
1. L'intégration continue dans l'OpenSpace (le lance-missile couplé à Jenkins)
1. Why you need to fail (redite de la keynote de Claire)

et deux autres que je n'ai pas eu le temps d'écouter, parce qu'il fallait bien manger à un moment ! Auto-organisation autour de la table à sandwich : tout le monde à eu sa part :)


## Felix Geisendörfer  : The NodeJs scalability Myth

> "Je dois gérer 1000 req/s sur mon site Web"  "Ok, met un mongoDB et du Node, et c'est finger-in-the-nose"
>> No !!!

> "Thread don't scale, event loop do"
>> No !!!
	
La vérité, c'est qu'il faut utiliser le bon outil pour le bon job. Cela implique donc de connaitre et comprendre ses outils.

Node c'est :

- Single thread model. Comme dans les navigateurs. Si votre application ne crée pas de thread, elle n'utilisera qu'un seul processeur et n'exécute qu'une instruction à la fois.
- Rien n'interrompt l'exécution du code. Donc si vous rentrez dans une boucle infinie, les handlers d'évènements attendront... un temps infini.
- Une compilation Just In Time. Et V8 est très bon à ça. Il compile et optimise à la volée, 
- Un modèle de concurrence simple : aucune mémoire partagée. Pour échanger entre les thread, on s'échange des messages (par exemple avec un ZeroMQ ou un Redis).
- Pas de limite mémoire, et une empreinte mémoire négligeable au démarrage
- Une bonne scalabilité verticale nativement. Mais ce sera toujours moins bien qu'un outil dédié écrit au poil
- Aucune scalabilité horizontale native : c'est à votre application de gérer ça (note perso : cluster vous y aidera)
- Un language avec un garbage collector. Si vous faites des usages intensifs de mémoire, il faut utiliser des streams et des buffers. Si vous faites vraiment des usages très intensifs, passez votre chemin.

En fonction de vos besoins, c'est à vous de choisir. Vous pouvez considérer chaque item comme un point fort ou une faiblesse. C'est une question de besoins.


Felix est un "core contributor" de NodeJS. Il ne cache pas qu'il existe des problèmes avec NodeJs, notamment des memory leaks, parfois même dans V8. 
J'ai vraiment apprécié sont honnêteté, et la justesse de sa position : 
> ne soyez pas naïf, il n'y a pas d'outils/framework/language miracle qui résoudra tous vos problèmes par magie. Connaissez vos outils, utilisez-les à bon escient.


## Mathieu Poumeyrol (Fotopedia) : MongoDB, Mustache... vers la mort du cache

2 parties très antagonistes pour cette conférence. 
D'abord un excellent retour d'expérience sur la scalabilité chez Fotopedia, qui a commencé avec un service écrit en Ruby on Rails + BDD MySQL,et dont les mauvaises performances étaient rédhibitoires.

Le discours est didactique, factuel, pointu, et détaille les différents mécanismes mis en oeuvre empiriquement pour gagner de précieuses millisecondes.

Ensuite, la justification de l'usage de MongoDB. Changement de ton : une critique non constructive et caricaturale du monde SQL. 
Quelques contre-vérités. 
Rigolo mais trompeur : on se croierai en 2009 à l'époque où l'on présentait ça comme LA solution ultime qui répond à TOUS les besoins.
(Je précise que j'utilise quotidiennement MongoDB et NodeJS, et que j'en suis fan). 

cf. plus haut : 
>Connaissez vos outils, utilisez-les à bon escient. 

C'est dommage, car cela à fortement porté préjudice au message du speaker. 


## Gilles Mantel (Xebia): Automatisation des tests : le mythe du ROI

Dernière conf. Il fait chaud, l'auditoire commence à flancher. No problem, Gilles à su nous captiver.
Très simplement, il explique le mur qu'il a pris lorsqu'en tant que consultant, il a voulu convaincre de l'intérêt d'automatiser des tests.

>J'ai convoqué les chefs d'équipe, et j'ai présenté deux courbes : le coût des tests manuels, et le coût+ investissement des tests auto. 
>Le point d'équilibre se situe approximativement à deux ans...

La source du problème, c'est de ne pas prendre en compte les bons paramètres.

La bonne métrique, c'est le coût d'une anomalie (coût qui augmente exponentiellement avec la découverte tardive : très cher en production).
Pour illustrer cela, Gilles applique le modèle de rentablité des options financières aux tests automatisé, et obtient une prédiction bien plus fiable.
En effet, la question n'est pas 

>Combien je gagne à automatiser les tests ?

Mais plutôt

>Combien je perds à chaque anomalie que je laisse passer en production ?

Il devient plus facile de calculer l'investissement à mettre dans l'automatisation ainsi. Ex: 

- 1 bug en production me coûte 5000€ 
- J'investie 15 000€ dans l'automatisation de tests
- Si mes tests automatisés n'identifient aucun bug, j'ai perdu 15 000€
- Si mes tests automatisés identifient 3 bugs, je suis à l'équilibre
- Si mes tests automatisés identifient 10 bugs, j'ai évité de perdre 35 000€

Le ROI des tests automatisé n'est pas en fonction du temps, mais de la qualité (nombre de bugs) du produit.

La deuxième question devient donc :

>Quels tests automatiser dans la limite de mon investissement ?

Tout dépends de votre projet.

Dans un projet Agile, on peut imaginer une pyramide des tests :
    en haut quelques tests end-to-end (1-5%)
    au milieu peu de tests d'intégration (5-15%)
    en bas les nombreux tests unitaires (80-90%)
	
le ROI sera meilleur en automatisant à partir du "bas" et en remontant, car le code s'y prête mieux.

Dans un projet plus classique, c'est la pyramide inverse :
    en haut les cahiers de tests (80-90%) 
    au milieu les tests d'intégration (5-15%)
    en bas les tests unitaires inexistants (1-5%)
	
Au contraire, inutile de perdre du temps à chercher une couverture de test unitaire d'un code qui n'est pas prévu pour.
C'est couteux et peu rentable. Mieux vaut automatiser en partant du "haut" et en descendant.


## Conclusion

Une journée très riche et passionnante ! Pour moi, c'est vraiment une réussite.

D'un point de vue orga, chapeau. Aucun accros, des salles pleines mais personnes assi par terre, la nourriture abondante et de qualité, le site web ultra-pratique :)

D'un point de vue contenu, on retrouve la dualité propre à Mix-it : Agile et Techos, multi-langages, de l'ergo au devops.


Vivement les vidéos !
Encore bravo, et à l'an prochain.

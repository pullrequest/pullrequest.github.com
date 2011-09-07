---
layout: post
title: Un aperçu de RESThub 2
author: loicfrering
tags: [resthub, java]
published: true
---

Après la [sortie récente de RESThub
1.1](http://pullrequest.org/2011/06/28/resthub-1-1.html), nous
commençons à étudier les nouveautés que nous souhaiterions intégrer à
RESThub 2.

## Spring 3.1

Tout d'abord, RESThub 2 se basera sur Spring 3.1 et essaiera de tirer
parti des nombreuses fonctionnalités amenées par cette nouvelle version.
La première nouveauté de Spring 3.1 dont profitera RESThub 2 sera la
possibilité de configurer entièrement votre application Spring en Java.
Ainsi tous les éléments de configuration de l'ApplicationContext mis à
disposition par RESThub auront un équivalent en annotation du type
@Enable\* comme @EnableEntityScan.  Pour plus de détails sur la
configuration en Java de Spring, je vous invite à consulter [cet
article](http://blog.springsource.com/2011/06/10/spring-3-1-m2-configuration-enhancements/)
sur le blog de Spring Source.

La seconde fonctionnalité apportée par Spring 3.1 dont RESThub 2 tirera
profit est la notion de profils Spring. Avec Spring 3.1, il est possible
de définir des ensembles de beans différents en fonction d'un profil
donné qui peut être défini au runtime. A l'instar des profils Maven,
plusieurs profils peuvent être activés simultanément. Nous envisageons
quelques pistes d'utilisation des profils sur RESThub : nous pourrions
établir un profil dédié au monitoring ou bien même différents profils
RESThub pour différentes sources de données :

* jpa pour les bases de données relationnelles
* mongodb pour les bases MongoDB via Spring Data
* ogm pour Hibernate OGM

Pour terminer sur les profils Spring, nous évaluerons la pertinence de
leur utilisation pour les environnements de déploiements (local, dev,
qualif, prod) et leur intégration avec la gestion des profils Maven.

Une autre nouveauté que nous souhaitons exploiter concerne la nouvelle
option packagesToScan du LocalContainerEntityManagerFactoryBean pour
remplacer les options include-entities et exclude-entities du namespace
RESThub. En effet cette option devrait permettre à présent de scanner
les entités venant du classpath et donc de favoriser la création de
projets multi-modules.  Cependant il reste à voir s'il sera possible de
gérer plusieurs persistence units via cette option, configuration que
supporte RESThub actuellement avec son implémentation native du scan
d'entités.

Enfin nous verrons comment tirer parti de la nouvelle couche
d'abstraction pour le cache de données apportée par Spring 3.1. Elle
pourrait permettre la mise en cache des données rappatriées par des
finders avec des stratégies de rétention configurables via une simple
annotation.

## Spring Data

RESThub 1.x repose sur Hades pour la couche d'accès aux données. C'est
Hades qui fournit l'implémentation de base des GenericDao proposés par
RESThub. Or le lead developer de Hades, Oliver Gierke, a été débauché
par Spring pour participer à l'initiative [Spring
Data](http://www.springsource.org/spring-data) qui regroupe un ensemble
de projets facilitant l'implémentation de votre couche d'accès aux
données sur tout un ensemble de technologies de persistance, allant des
bases relationnelles avec Spring Data JPA aux bases NoSQL avec par
exemple Spring Data Redis, Neo4j, MongoDB.

Ainsi RESThub reposera principalement sur Spring Data pour l'accès aux
données et en particulier Spring Data JPA qui est le successeur d'Hades.
Nous tirerons donc partie des dernières fonctionnalités apportées par
Spring Data JPA pour simplifier encore la mise en oeuvre de la couche
d'accès aux données.

Enfin, comme signalé plus haut, nous faciliterons le support des bases
NoSQL via l'intégration des autres projets du portfolio Spring Data.

## QueryDSL

Si vous avez déjà utilisé les API Criteria JPA2, vous savez certainement
la lourdeur de mise en oeuvre de celles-ci ainsi que leur verbosité.
[QueryDSL](http://www.querydsl.com/) propose une interface fluide (ou
fluent API) pour la construction dynamique et typée de requêtes JPA, JDO
ou SQL en Java.

D'autre part Spring Data JPA s'intègre dans ses dernières versions avec
QueryDSL et il nous semble très intéressant d'intégrer cette technologie
à la prochaine version de RESThub tant elle facilite et rend agréable
l'écriture et la construction de requêtes dynamiques tout en permettant
un refactoring aisé de celles-ci au besoin.

## Monitoring

Nous souhaitons intégrer dans RESThub le support de JMX dans Spring.
Couplé avec les profils Spring 3.1, RESThub pourrait grandement
faciliter le monitoring de vos applications : il suffirait d'activer un
profil 'monitor' par exemple pour bénéficier automatiquement du
monitoring JMX pour votre application RESThub.

## Rapid Application Development

Avec RESThub, nous souhaitons mettre à disposition des développeurs Java
une stack de technologies cohérente dont la mise en oeuvre est
simplifiée au maximum. Nous souhaitons aller encore plus loin dans cette
démarche et s'inspirer du principe
[YAGNI](http://fr.wikipedia.org/wiki/YAGNI) avec RESThub 2 en proposant
des profils de configuration limitant le nombre de couches logicielles
lorsque cela n'est pas nécessaire. Ainsi il serait possible de très
rapidement mettre en place des applications Web en se passant du code
superflu.

## Documentation et modularisation

Pour faciliter l'utilisation de RESThub et son adoption, un effort
important sera fait sur la [documentation](http://resthub.org/) des
prochaines versions. En plus de celle-ci, des exemples et tutoriels
documentés mettront en avant les bonnes pratiques de développement avec
RESThub alors que des archetypes Maven permettront de rapidement mettre
en place votre projet basé sur RESThub.

Afin de favoriser son intégration nous travaillerons également sur la
modularisation de RESThub. Cela permettra d'utiliser des modules
spécifiques de RESThub sans pour autant charger tout RESThub en
dépendance transitive. Enfin nous veillerons à séparer les exemples pour
les pousser dans leur propre repository sur Github.

## Roadmap

Une première version alpha de RESThub 2 est prévue pour les prochaines
semaines. Elle se basera sur la branche
[spring-data](https://github.com/pullrequest/resthub/tree/spring-data)
actuellement en développement et apportera donc l'intégration de Spring
Data JPA en remplacement de Hades.

Nous prévoyons ensuite de sortir une nouvelle alpha par fonctionnalité
intégrée avec en feuille de route prévisionnelle (suivez les liens pour
avoir le détail des milestones sur Github) :

* [1.1.2](https://github.com/pullrequest/resthub/issues?milestone=2&state=open)
* [1.1.3](https://github.com/pullrequest/resthub/issues?milestone=4&state=open)
* [2.0.0-alpha1](https://github.com/pullrequest/resthub/issues?milestone=3&state=open)
* [2.0.0-alpha2](https://github.com/pullrequest/resthub/issues?milestone=5&state=open)
* [2.0.0-alpha3](https://github.com/pullrequest/resthub/issues?milestone=6&state=open)
* [2.0.0-alpha4](https://github.com/pullrequest/resthub/issues?milestone=7&state=open)
* [2.0.0-beta1](https://github.com/pullrequest/resthub/issues?milestone=8&state=open)

N'hésitez pas à nous donner votre avis sur ce que nous prévoyons
d'intégrer dans RESThub 2 ainsi qu'à nous proposer les fonctionnalités
que vous aimeriez voir arriver avec cette prochaine version !

D'autre part RESThub est un projet ouvert aux contributions alors
n'hésitez pas à [cloner le projet sur
Github](https://github.com/pullrequest/resthub) et à proposer des **pull
requests** !

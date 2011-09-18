---
layout: post
title: MIX-IT Un départ sur les chapeaux de roues
author: feugy
tags: [conference, mix-it, agile, spock, tests, tdd, bdd, ergonomie, clojure, machine-learning, mahout, devops]
---

Mardi 5 avril, j'ai eu le plaisir d'assister à un 'mini-Devoxx' lyonnais : Mix-IT (lire, mixitée)

Organisé par le C(lub) A(gile) R(hone) A(lpin) et le Lyon JUG, dans les locaux de l'Epitech, cette première édition de la conférence a rassemblé 250 personnes autour de 20 speakers et 4 ateliers.

Vous trouverez sur [le site][1] le programme et les speakers.

5 thèmes : Techy, Agility, Mixy, Trendy et Gamy (ateliers pratiques).

*   1h de Keynote d'introduction
*   1h de prise de badges et petit dej
*   5x1h pour chaque conférence,
*   15 minutes de pauses, 1h30 pour manger (sandwitch)
*   1h de buffet de clôture.
*   20€ l'inscription

Autant leur dire tout de suite un grand bravo : l'organisation a été très pro et sans aucuns accrocs. Fluide, facile, locaux nickels, conditions excellentes pour les speaches.

## Keynote : vous reprendrez bien un verre de Mart-i-gnole ?

Nicolas Martignole, alias "[Le touilleur express][2]", nous a fait un condensé fort intéressant sur le "Industrialized software craftmanship" : en gros, nous sommes tous des développeurs, professionnels, outillés, responsables, autonomes. Alors revendiquons-le, et conduisons-nous comme tel.

Un gros focus sur l'agile : "Coder une appli, ce n'est pas construire un pont ou une centrale nucléaire", alors itérons, et focalisons-nous sur le résultat de l'appli, pas sur les moyens de la coder.

Je retiendrais juste une phrase qui m'a fait beaucoup rire :  "Le client est roi, mais on n'est pas sa mère non plus". Concentrons nous sur ce qu'il nous demande, sans nous compromettre (toujours cette question de professionnalisme), et parlons sa langue (son métier) et pas la nôtre (la technique).

## Session 1 : Tests du futur avec Spock

Mlle Mathilde Lemee (JDuchess) nous a cueillis de bon matin avec un grand bol de code. Et c'était bien :)

[Spock ][3] est un framework de B(ehaviour) D(riven) D(eveloppement) en [Groovy][4].  
En clair, un framework de test compatible Java ou l'on décrit ses tests sous la forme "mon application doit XXX. Etant donné YYYY, lorsque ZZZ alors WWW"

Exemple:

{% highlight ruby %}
def "liste should add new elem" () {
    given:
        def list = new ArrayList()
        def elem = "push me"
    when:
        list .add(elem)
    then:
        !list .empty
        list.size() == 1
        list.[0] == elem
}
{% endhighlight %}

Normalement, cela se passe de commentaire : le code est autodocumenté.  
C'est du groovy et ça utilise les labels (Ahhh, le grand retour du goto).  
L'idée est de faire du code de test ultra lisible, à partir des spécifications, et qui sera facilement maintenable.

Je n'entre pas dans les détails, mais on peut très facilement, Mocker, Stubber, faire du D(ata)D(riven)D(eveloppment), et même du test d'IHM avec GED (surcouche à Selenium).

{% highlight groovy %}
def "user should be well filed" () {
    setup:
        UserService service = new UserService()
    expect:
        User user = service.get(username)
        user.firstName == firstName
        user.id == userId
    where:
        username    | firstname | userId
        'user1'     | 'a'       | 1
        'user2'     | 'b'       | 2
}
{% endhighlight %}


Affaire à suivre !!

## Session 2 : Les outils de l'ergonome Agile

Session proposée par Cyrille Deruel (ergonome), Florent Chavanat ([chef de projet Agile][5]), tout deux de chez Micropole.

Après une petite introduction sur ce qu'est, et n'est pas l'ergonomie (ce n'est pas un ensemble de recettes, ni une composition de widgets graphiques), les speaker nous expliquent pourquoi ils estiment que les démarches d'un ergonome et celles d'un SCRUM master convergent.

Tout tient en quelques mots :

*   **User-Centric**. Pour aller chercher les besoins réels, pas ceux traduits par le client.
*   **Pragmatisme. ¨**Pas de grands principes, remise en question permanente.
*   **Itérer, Itérer, Itérer**. En prenant en compte les contraintes projet, c'est à dire sans refonte majeure toute les 3 semaines

Florent, l'ergonome, en profite pour passer quelques messages toujours bons à rappeler :

*   "le produit doit répond au besoin de l'utilisateur". C'est bête, mais souvent on répond au besoin du client. Notez la nuance.
*   Trop de fonctionnel nuit : il faut focaliser l'utilisateur sur l'essentiel.

## Session 3 : Introduction a Clojure

[Clojure ][6] est un de ces "nouveaux langages de la JVM". Comprenez que c'est un langage avec sa syntaxe et son compilateur propre, mais qui produit du bytecode interprétable sur une JVM classique.

Clojure a été inventé par Rich Hikey avec 4 objectifs :

*   Réduire au maximum la complexité accidentelle (celle qui est inhérente aux outils, pas au problème traité)
*   Permettre et faciliter la gestion de la concurrence
*   Offrir une grande expressivité
*   Etre compatible avec les assets java existants (JVM, librairies, frameworks)

Clojure est un langage "à base fonctionnelle", c'est à dire, dont l'unité est la fonction, et pas la classe. Oui, vous avez bien lu, pas de POO avec Clojure.  
C'est aussi un langage de la famille de [Lisp][7].

A quoi ça ressemble ? Accrochez-vous. Voila une ligne qui permet d'additionner 2 à 2 tous les éléments d'un tableau, et de renvoyer le tableau résultat.

{% highlight clojure %}
(map fn[it] (+ it 2) [1 2 3])
{% endhighlight %}

Et la console interactive affichera \[3 4 5\]

### Déclarer une function

*   Java: `static retour nomFonction(arg1) {instructions}`
*   Clojure: `fn[arg1] intructions`

### Invoquer une function

*   Java: `nomFonction(arg1 arg2);`
*   Clojure: `(nomFonction arg1 arg2)`

### Utiliser un opérateur

*   Java: `var+2`
*   Clojure: `(+ var 2)`

Je ne vous le fait pas dire, c'est illisible lorsqu'on a pas l'habitude. Ca fait donc assez peur au début. Mais retenez juste ceci :

*   Du concurrentiel sans efforts. Toutes les variables sont immuables, tout est donc parallélisable. La notion de transaction (atomicité, cohérence, isolée, durable) est inhérente au langage
*   Optimisé. Pas de reflexion au runtime, des variable partiellement garbage-collectées (notion de laziness à l'intérieur d'un tableau)
*   Interopérable. Aucun problème pour remplacer la couche service de son service Web, et conserver la persistance avec Hibernate et la présentation avec Tapestry.
*   Outillée. On utilise un plugin Eclipse pour éditer le code, et on rassemble tout au sein du même IDE.

## Session 4 : Intelligence collective avec apache Mahout

* Pourquoi les généraux se baladent-ils toujours à cheval ?
* Parce qu'il y a plus de choses dans deux têtes que dans une.

L'idée est donc d'exploiter les informations dispatchées dans nos SI et d'en extraire des choses remarquables.  
[Michaël Figuière][9] (xebia) nous parle de "Machine Learning", de NoSQL, et de moteur de recherche (ce que les américains regroupent sous le vocable "BigData").

[Apache Mahout][10] est la première initiative opensource Java (aux dires du speakers) pour rassembler des implémentations d'algorithme de "Machine Learning".  
C'est massivement basé sur Hadoop, pour bénéfier de très vastes volumes de données à traiter, et d'une implémentation efficace de MapReduce (parallélisation des algos de traitements).

Que peux-t-on faire avec ?

*   Etablir des liens entre les éléments et proposer ainsi des suggestions (ex: moteur de recommandation)
*   Classifier les éléments : apposer des catégories/tags en fonciton du contenu (ex: tag automatiques de mails)
*   Clusteriser les éléments : trier les éléments existants (ex: répartition de charge, sharding)

Malheureusement et à mon grand regret, le speaker ne rentre pas du tout dans les détails de la librairie Mahout, et se contente d'expliquer les concepts et les applications possibles.

Néanmoins, les quelques lignes de codes qu'il nous a proposé montre une API simple et lisible. A suivre donc !

## Session 5 : devops

Vous avez surement entendu parlé de ce mouvement. [Gildas LeNadan][11] nous rappelle qu'il ne s'agit ni d'un rôle, ni d'une étiquette ou d'une labelisation.  
Il ne faut pas être synchozophrène pour adhérer à devops, même si une connaissance des deux cultures est appréciable.

Alors qu'est-ce que Devops ? "Un mouvement visant à l'alignement des SI sur les besoins de l'entreprise' (je cite)

D'où vient-il ? Des constants que

*   les Pure Players du Web ont démontré que l'outil informatique n'est pas un centre de coût mais bien un differentiateur pour une société
*   que le temps du mainframe est révolu. Le service à supplanté le serveur
*   les indicateurs business actuel sont le Mean Time To Diagnose/Repair/Communicate. Et plus l'uptime
*   de l'existence de la dette d'infrastructure

[Devops][12], c'est donc une philosophie qui propose d'introduire de l'agilité dans l'exploitation de nos services, avec comme moyen d'action une responsabilisation et une sensibilisation des deux "populations" : les développeurs et les exploitants.

Devops, ce n'est pas un manifeste, mais des valeurs :

*   **Partage**. De la vision, des problèmes, du glossaire, de la connaissance des outils, des feedbacks
*   **Mesurabilité**. Des services, des outils. Et il faut définir en commun les K(ey) P(erformance) I(ndicator)  
    (Oui, une courbe CPU et une consommation mémoire n'aident pas à diagnostiquer un dysfonctionnement d'une application : il faut aussi des indicateurs métiers)
*   **Automatisation**. L'humain est faillible, est l'humain a raison d'être faignant. Faisons faire aux machines tout ce qui peut l'être, et laissant aux hommes les tâches décisionnelles et à valeur ajoutée.
*   **Culture**. Coopération des gens, valorisation de l'innovation, de la créativité, de la fierté, reconnaissance des succès et des responsabilités

## Conclusion : elle à tout d'une grande

Une organisation sans faille, une grande richesse dans les speaches, un vaste panel de sujets... Pour moi, Mix-IT n'a pas usurpé son nom, et c'est une première édition vraiment prometteuse.

Rendez-vous l'an prochain pour voir s'ils sauront transformer l'essai !

 [1]: http://www.mix-it.fr/
 [2]: http://www.touilleur-express.fr/
 [3]: http://code.google.com/p/spock/
 [4]: http://groovy.codehaus.org/
 [5]: http://www.bouzin-agile.fr
 [6]: http://clojure.org/
 [7]: http://fr.wikipedia.org/wiki/Lisp
 [8]: https://km.atosorigin.com/Livelink/livelink.exe?func=ll&objId=62367770&objAction=browse&sort=name
 [9]: http://www.parisjug.org/xwiki/bin/view/Speaker/MichaelFiguiere
 [10]: http://mahout.apache.org/
 [11]: http://www.linkedin.com/in/gildaslenadan
 [12]: http://www.planetdevops.net/

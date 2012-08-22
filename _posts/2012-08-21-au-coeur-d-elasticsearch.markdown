---
layout: post
title: Au coeur d'ElasticSearch
author: filirom1
tags: [index, elasticsearch, lucene]
---
Au cœur d'[ElasticSearch](http://www.elasticsearch.org/) il y a le moteur d'indexation [Lucene](http://lucene.apache.org/), et autour de Lucene il y a plusieurs mécanismes afin de rendre le système scalable et tolérant aux pannes. Commençons par comprendre comment Lucene fonctionne, et nous finirons par les mécanismes de distribution et de tolérance aux pannes mis en place dans ElasticSearch:

<p class="center">
  <img src="/public/img/2012-08-21-au-coeur-d-elasticsearch/eslogo.png" border="0" />
</p>



## Analyser

Pour comprendre Lucene, il faut comprendre ce qui se passe lorsque l'on indexe un texte.

Prenons une phrase :

    Doc1 = 'Road to a Distributed Search Engine'.


Avant d'indexer cette phrase Lucène lui faire subir quelques modifications

[Transformons la en minuscule](http://www.elasticsearch.org/guide/reference/index-modules/analysis/lowercase-tokenizer.html) : Doc1 = 'road to a distributed search engine'

[Enlevons les mots de liaisons](http://www.elasticsearch.org/guide/reference/index-modules/analysis/stop-tokenfilter.html) : Doc1 = 'road distributed search engine'

Ce type d'analyse est très basique mais nous pourrions imaginer des choses plus complexes :

* [enlever les balises HTML présentes](http://www.elasticsearch.org/guide/reference/index-modules/analysis/htmlstrip-charfilter.html)
* [remplacer certains mots par un synonyme](http://www.elasticsearch.org/guide/reference/index-modules/analysis/synonym-tokenfilter.html)
* [remplacer les mots par un équivalent phonétique](http://www.elasticsearch.org/guide/reference/index-modules/analysis/phonetic-tokenfilter.html)
* [remplacer les mots par leurs racines](http://www.elasticsearch.org/guide/reference/index-modules/analysis/stemmer-tokenfilter.html)
* Supprimer les numéros de carte bancaire à l'aide d'une expression régulière.

Vous aurez compris que le rôle des `Analyser` est de transformer un texte avant l'indexation.


NB: avec ElasticSearch il est possible de [tester les Analysers simplement](http://www.elasticsearch.org/guide/reference/api/admin-indices-analyze.html)

## Index Inversé

Une fois le texte analysé et transformé, il faut maintenant le stocker dans une structure de données: l'index inversé.

[Créons un index inversé](http://fr.wikipedia.org/wiki/Index_invers%C3%A9) à partir du document précédent après analyse (Doc1 = 'road distributed search engine'):

Le contenu de l'index inversé ressemblera à ça:

Inverted Index:

    "road" : {Doc1}
    "distributed" : {Doc1}
    "search": {Doc1}
    "engine" : {Doc1}

Un index inversé est très proche [des index que nous trouvons à la fin des livres techniques](http://sqlpro.developpez.com/cours/indextextuelle/images/indexMIN.gif)

Maintenant opérons de même pour la phrase suivante : Doc2 = 'ElasticSearch a distributed, RESTful Search Engine'

L'index inversé ressemble maintenant à ça:

Inverted Index:

    "road" : {Doc1}
    "distributed" : {Doc1, Doc2}
    "search": {Doc1, Doc2}
    "engine" : {Doc1, Doc2}
    "elasticsearch": {Doc2}
    "restful": {Doc2}

Un index inversé peut être vu comme une base [clé: multiples valeurs](http://en.wikipedia.org/wiki/Multimap).


## Requêtes

Maintenant que nous avons une base clé - multiple valeurs, il est assez facile de faire une recherche sur un terme:

    Get from index: "engine" => {Doc1,Doc2}

Les IDs des documents nous sont retournés.

## Indexer != Stocker

Si nous souhaitons que ce soit le document et non l'ID qui soit retourné, il faut stocker le document à côté.

Storage:

    "Doc1":"Road to a Distributed Search Engine"
    "Doc2":"ElasticSearch a distributed, RESTful Search Engine"

Il faut donc interroger les deux bases : l'index inversé puis la base clé-valeur contenant les documents.

    Get from index: "engine" => {Doc1,Doc2}
    Get from storage: Doc1 AND Doc2 => ["Road to a Distributed Search Engine", "ElasticSearch a distributed, RESTful Search Engine"]


Mais le fait de stocker le document en plus de l'index est couteux en mémoire. Nous pouvons donc imaginer fonctionner sans stockage de documents : [ElasticSearch-source-field](http://www.elasticsearch.org/guide/reference/mapping/source-field.html), [Lucene-store-field](http://lucene.apache.org/core/3_6_0/api/all/org/apache/lucene/document/Field.Store.html)


## Requêtes et Analysers

Lors de l'indexation du premier document : 'Road to a Distributed Search Engine', seulement les mots suivant avaient été indexés 'road distributed search engine'.

Si nous recherchons les mots initiaux dans l'index inversé, nous n'obtiendrons aucun résultat:

    Get from index: "Road" => {}
    Get from index: "Distributed" => {}

Les mots avaient été indexés en minuscule.

Il est donc important d'appliquer les mêmes Analysers pour l'indexation et la recherche. C'est le comportement par défaut dans ElasticSearch.

    Search: "Road" => {}
    Get from index: "road => {Doc1}


## Syntaxe de requête


Et si nous cherchions "(road OR path) AND search"

Inverted Index:

    "road" : {Doc1}
    "distributed" : {Doc1, Doc2}
    "search": {Doc1, Doc2}
    "engine" : {Doc1, Doc2}
    "elasticsearch": {Doc2}
    "restful": {Doc2}

Query:

    Get from index: "road => {Doc1}
    Get from index: "path => {}
    Evaluate: (road OR path) => {Doc1}
    Get from index: "search => {Doc1, Doc2}
    Evaluate: (road OR path) AND search => {Doc1}
    Return => {Doc1}

A partir d'un index inversé nous pouvons commencer à construire des requêtes complexes
[Syntaxe des requêtes Lucene](http://lucene.apache.org/core/3_6_1/queryparsersyntax.html).

Mais ce n'est rien comparé à ce que Lucene est capable de faire.


## Lucene

Nous venons de voir les bases d'un moteur d'indexation.
Lucene est un moteur d'indexation écrit en Java qui supporte l'ensemble des fonctionnalités vues précédemment et bien plus encore.

### Indexation d'un objet

Nous avons vu précédemment que Lucene pouvait indexer du texte

    Doc1 = 'Road to a Distributed Search Engine'.

Mais en réalité Lucene permet d'indexer des objets complexes, et faire des recherches en ne sélectionnant que certains champs.

    Doc1 = {
      "aText": "Road to a Distributed Search Engine",
      "anInt": 42,
      "anGeoLoc": {
        "lat": 45.5,
        "lon": 7.02
      },
      "anArray": ["tata", "toto", "titi"]
    }

Lucene permet d'indexer du texte mais pas seulement; il permet aussi d'indexer des nombres, des tableaux, des objets de géo-distances, ...
Voici la liste des [types primitifs](http://lucene.apache.org/core/3_6_1/fileformats.html#Primitive Types) indexables dans Lucene.


### Structuration des fichiers Lucene

Une base Lucene est constituée d'un certain nombre de [fichiers](http://lucene.apache.org/core/3_6_1/fileformats.html#file-names):

    $ cd /DATA/smartdata/search-bench/nodes/0/indices/4e60bb2aeea3ef8c39000001/0/index
    $ ls -lh _2u*
    -rw------- 1 www server  22M Jul 19 18:17 _2u.fdt
    -rw------- 1 www server 237K Jul 19 18:17 _2u.fdx
    -rw------- 1 www server  233 Jul 19 18:17 _2u.fnm
    -rw------- 1 www server 5.2M Jul 19 18:17 _2u.frq
    -rw------- 1 www server 385K Jul 19 18:17 _2u.nrm
    -rw------- 1 www server 3.8M Jul 19 18:17 _2u.prx
    -rw------- 1 www server 135K Jul 19 18:17 _2u.tii
    -rw------- 1 www server  15M Jul 19 18:17 _2u.tis

 * .fdt : Stockage des documents bruts
 * .fdx : Index permettant de retrouver les champs dans le fichier .fdt
 * .fnm : Contient le nom des champs
 * .frq : Index inversé qui contient également la fréquence d'occurrence de chaque terme
 * .nrm : Normalise l'importance de chaque terme relativement à la longueur du texte, ou via un facteur de [boost](http://lucene.apache.org/core/3_6_1/queryparsersyntax.html#Boosting%20a%20Term)
 * .prx : Stocke la position des termes dans le texte initiale
 * .tii : Fichier complètement chargé en mémoire qui permettra de lire le fichier .tis
 * .tis : Dictionnaire des termes

Si le nombre de fichiers ouverts devient trop important (supérieur à la limite indiquée par 'ulimit -n' ) il est possible de grouper la plupart de ces fichiers: [compound_format avec ElasticSearch](http://www.elasticsearch.org/guide/reference/index-modules/index.html).

[Un aperçu du format des fichiers Lucene](http://lucene.apache.org/core/3_6_1/fileformats.html#Overview) nous permet de comprendre les possibilités offertes par Lucene:

 * Donner de l'importance à certains champs
 * Prendre en compte la proximité des mots lors de la recherche
 * Prendre en compte le nombre d'occurrences d'un mot dans un texte
 * Prendre en compte la longueur du texte


### Notion de segments

La structure des fichiers Lucene est complexe mais elle permet de garantir de bonnes performances de recherche et d'indexation.

Ces fichiers qui constituent [un segment](http://lucene.apache.org/core/3_6_0/fileformats.html#Segments) sont immuables, c'est-à-dire qu'il n'est pas possible de les modifier.

Tout ajout de données sera fait dans un nouveau segment.

Le premier segment s'appelle _1.extention, puis ensuite _2.extension, ..., _a.extension, ..., _z.extension, _11.extension, ... suivant une [base 36](http://en.wikipedia.org/wiki/Base_36).

Lorsque le nombre de segments devient trop important, il devient nécessaire de merger plusieurs segments.

Lorsqu'un document doit être supprimé, le segment n'est pas modifié, une entrée est ajoutée dans un autre fichier afin d'ignorer ce document pendant les recherches. Pendant les merges, les documents marqués comme à supprimer sont enlevés.

Dans cet exemple je liste les différents segments trouvés dans un index Lucene (en n'affichant que les .tis)

    $ ls -lh *.tis
    -rw------- 1 www server  20M Jul 19 18:17 _1a.tis
    -rw------- 1 www server  18M Jul 19 18:17 _1t.tis
    -rw------- 1 www server 4.4M Jul 19 18:17 _21.tis
    -rw------- 1 www server  64K Jul 19 18:17 _24.tis
    -rw------- 1 www server  20M Jul 19 18:17 _2b.tis
    -rw------- 1 www server  29K Jul 19 18:17 _2g.tis
    -rw------- 1 www server  44K Jul 19 18:17 _2j.tis
    -rw------- 1 www server 9.5M Jul 19 18:17 _2k.tis
    -rw------- 1 www server  22K Jul 19 18:17 _2m.tis
    -rw------- 1 www server 1.9M Jul 19 18:17 _2t.tis
    -rw------- 1 www server  15M Jul 19 18:17 _2u.tis
    -rw------- 1 www server 930K Jul 19 18:17 _2v.tis
    -rw------- 1 www server 2.5M Jul 19 18:17 _2w.tis
    -rw------- 1 www server 2.3M Jul 19 18:18 _2x.tis
    -rw------- 1 www server  11M Jul 19 18:17 _c.tis
    -rw------- 1 www server  19M Jul 19 18:17 _o.tis

Il existe différentes [politiques de merge avec ElasticSearch](http://www.elasticsearch.org/guide/reference/index-modules/merge.html).

Les merges sont effectués dans un [thread séparé en tâche de fond](http://lucene.apache.org/core/3_6_0/api/all/org/apache/lucene/index/IndexWriter.html), ce qui à l'avantage de ne pas bloquer l'indexation de nouvelles données.

### Bufferiser la création de segments

Nous venons de voir que l'indexation de nouvelles données provoque la création d'un nouveau segment. Par conséquent, il pourrait y avoir autant de segments que de données, ce qui n'est pas souhaitable.

La technique est de [bufferiser les indexations](http://lucene.apache.org/core/3_6_0/api/all/org/apache/lucene/index/IndexWriter.html) [en RAM](http://www.elasticsearch.org/guide/reference/modules/indices.html) afin de créer des segments plus gros et moins souvent.

Lorsque le nombre ou la taille des documents indexés en RAM sont trop importants, [un commit est effectué pour persister les données sur le disque](http://lucene.apache.org/core/3_6_0/api/all/org/apache/lucene/index/IndexWriter.html#commit()) ce qui aura pour conséquence de créer un nouveau segment.

Dans ElasticSearch on peut [forcer un commit](http://www.elasticsearch.org/guide/reference/api/admin-indices-flush.html)(cette opération peut être pratique avant de faire un backup), ou [empêcher les commits](http://www.elasticsearch.org/guide/reference/api/admin-indices-update-settings.html#disable_flush) (pratique pendant un backup).

### Near Realtime Search

Il n'est pas obligatoire d'attendre qu'un commit soit effectué pour faire des requêtes sur des données en RAM, Lucene propose un mécanisme appelé [Near Real Time Search](http://lucene.apache.org/core/3_6_0/api/all/org/apache/lucene/index/IndexWriter.html#getReader()) qui permet de requêter à la fois les données commitées et les données en RAM.

Néanmoins rafraichir l'IndexReader est une opération coûteuse qui [ne doit pas être fait après chaque indexation](http://www.elasticsearch.org/guide/reference/api/index_.html#Refresh).

C'est pour cela qu'il est préférable de le faire [périodiquement](http://www.elasticsearch.org/guide/reference/index-modules/index.html) ou [manuellement](http://www.elasticsearch.org/guide/reference/api/admin-indices-refresh.html).



## ElasticSearch

ElasticSearch est une solution permettant de distribuer Lucene sur plusieurs serveurs et d'interagir avec via une API REST.


### Mécanisme de tolérance aux pannes: Translog

Nous avons vu précédemment que la création de segment est bufferisée en RAM. Mais que se passe-t-il s'il y a une coupure de courant à ce moment-là ? Toute la donnée en RAM est perdue.

Pour pallier à ce problème-là, ElasticSearch utilise un [WAL (Write Ahead Log)](http://en.wikipedia.org/wiki/Write-ahead_logging) ou [Translog (Transaction Log)](http://es-cn.medcl.net/guide/concepts/scaling-lucene/transaction-log/).

La donnée est d'abord écrite dans un fichier de log avant d'être indexée en RAM. Lorsqu'un commit est effectué pour persister la donnée en RAM, l'ancien Translog est supprimé, et un nouveau est utilisé à la place.

Ainsi, si une coupure de courant a lieu lorsque des données sont en RAM, au redémarrage, ElasticSearch charge en RAM le contenu du Translog. Ainsi, le nœud se retrouve dans le même état qu'avant.

ElasticSearch a des [options](http://www.elasticsearch.org/guide/reference/index-modules/Translog.html) pour configurer la fréquence des commits en fonction de l'état du Translog.

Par défaut le [Translog ne fsync pas à chaque opération mais toute les 5s](https://github.com/elasticsearch/elasticsearch/blob/master/src/main/java/org/elasticsearch/index/gateway/local/LocalIndexShardGateway.java#L75). Mais ceci est [réglable](http://markmail.org/thread/lg2rdevj75fh77sy#query:+page:1+mid:pxda5eqquae2ylfm+state:results).

#### Real Time GET

Lucene permet de faire des recherches en Near Real Time en paramétrant le refresh, mais ElasticSearch permet également de [récupérer un document à partir de son ID](http://www.elasticsearch.org/guide/reference/api/get.html) en Real Time.

Quand un GET est reçu, ElasticSearch [regarde d'abord dans son Translog](http://elasticsearch-users.115913.n3.nabble.com/Clarification-about-real-time-get-with-index-updates-and-shard-replcation-td3433235.html) s'il contient un document avec cet ID, sinon ElasticSearch fait une recherche Lucene.

Cela signifie que le refresh ElasticSearch (commit Lucene) n'a aucun impact lorsque l'on récupère un document avec un GET.

### Shards

ElasticSearch permet de répartir une base Lucene sur plusieurs serveurs à des fins de scalabilité.

Une base Lucene est découpée en segments. Lorsque l'on interroge une base Lucene, on interroge l'ensemble des segments indépendamment. Pour rendre une base Lucene scalable, il suffit donc de repartir l'ensemble des segments sur les différentes machines.

Comme les segments sont régulièrement mergé par Lucene, nous ne pouvons pas répartir les segments sur les différentes machines (les merges ne fonctionnent que sur des segments locaux).
ElasticSearch découpe ses index en shards. Un shard est un index Lucene contenant plusieurs segments. Le shard pourra être déplacé sur n'importe quel nœud.
Si nous découpons un index ElasticSearch en N shards, il sera possible de répartir cet index sur N serveurs différents.
Comme un shard est l'unité la plus petite pouvant être distribuée (il ne sera pas possible de découper ce shard par la suite), il est important d'anticiper le nombre de shards souhaité.


Lorsque l'on interroge un index ElasticSearch, on interroge un nœud en particulier. Chaque nœud connaît la distribution des shards sur les différents nœuds. Interroger un index consiste donc à interroger l'ensemble des nœuds ayant un shard (Map Reduce).

Avoir beaucoup de shards implique interroger beaucoup de serveurs à chaque requête ce qui peut fortement augmenter la latence. Pour éviter cela, il est possible d'interroger seulement certains nœuds [suivant des critères](http://www.elasticsearch.org/guide/reference/api/search/preference.html). Une autre technique consiste à créer beaucoup d'index, par exemple un index par jours, et de faire [des requêtes sur un groupement d'index](http://www.elasticsearch.org/guide/reference/api/multi-index.html).


Lorsque l'on indexe une nouvelle donnée dans ElasticSearch, on lui [spécifie un index, un type, et un ID](http://www.elasticsearch.org/guide/reference/api/index_.html).

C'est à partir d'un hash sur le type et sur l'ID que l'on va définir quel shard lui sera attribué (shard = HASH(type, id) MOD nodes ). L'ID étant unique la répartition sur les shards est relativement uniforme.
Il est également possible de forcer l'emplacement de la donnée sur un nœud en fonction de [plusieurs](http://www.elasticsearch.org/guide/reference/modules/cluster.html) [critère](http://www.elasticsearch.org/guide/reference/api/index_.html#Parents & Children)[s](http://www.elasticsearch.org/guide/reference/api/index_.html#Routing).

<http://blog.sematext.com/2012/05/29/elasticsearch-shard-placement-control/>

#### Ajout d'un nœud

Lorsque l'on ajoute un nœud, ElasticSearch va répartir ses shards de manière équilibrée sur l'ensemble des machines disponibles. C'est ce qu'ElasticSearch appelle du rebalancing.

Pendant la phase de rebalancing, lorsque l'on veut déplacer un shard d'un nœud A à un nœud B, ElasticSearch ne va pas supprimer les segments, il va désactiver les flushs et ainsi empêcher les commits Lucene de se faire. Le shard en cours de rebalancing n'est pas bloqué, les opérations sur ce shard sont simplement écrites dans le Translog, indexé en RAM mais pas persisté. Lorsque le transfert du shard est terminé (tous les segments Lucene ont été copié) le Translog est rejoué sur le nouveau nœud.

Pendant tout le temps de rebalancing, on peut continuer à indexer et rechercher de la donnée, il y a seulement une courte période de temps où l'on bloque Lucene pour finaliser le changement.

<http://es-cn.medcl.net/guide/concepts/scaling-lucene/transaction-log/>

Si on ajoute un nœud avec de la donnée déjà présente (par exemple un nœud ayant déjà servi), [par défaut cette donnée est ajoutée au cluster](https://github.com/elasticsearch/elasticsearch/issues/2067).

#### Perte d'un nœud

Tout comme l'on peut ajouter des nœuds, on peut également en enlever. La phase de rebalancing sera enclenchée automatiquement.

Si l'on souhaite faire un redémarrage rapide d'un nœud sans rebalancing, il suffit de désactiver les allocations automatiques avant d'arrêter le nœud, puis de le réactiver après le redémarrage. Toutes ces opérations peuvent être faites via [une API REST](http://www.elasticsearch.org/guide/reference/api/admin-cluster-update-settings.html).

Le fait de ne pas maîtriser les allocations de shards peut être dangereux, et conduire à [perdre des nœuds en cascades](http://en.wikipedia.org/wiki/Cascading_failure).

#### Redémarrage complet du cluster

Il arrive des fois où l'on est obligé d'arrêter complètement le cluster pour le redémarrer. Dans ces cas-là, il faut penser à arrêter les machines exactement en même temps, ou sinon désactiver l'allocation automatique des shards car un rebalancing risquerait de démarrer avant d'être interrompu juste après.

Lorsque l'on arrête le cluster, et si un [local gateway a été mis en place (par défaut)](http://www.elasticsearch.org/guide/reference/modules/gateway/local.html), les données complètes du cluster (l'état du cluster, la répartition des shards par exemples) sont persistées sur chaque nœud.

Il peut y avoir des incohérences entre les nœuds s'ils n'ont pas tous été arrêté en même temps. Le nœud A s'arrête, le cluster change d'état (ajout d'un nouvel index), les autres nœuds s'arrêtent avec un autre état que le nœud A.

Il est important lors du redémarrage d'[attendre que la plupart des nœuds soit démarré](http://www.elasticsearch.org/guide/reference/modules/gateway/) afin de restaurer l'état du cluster le plus récent possible.


### Réplicas

ElasticSearch peut utiliser des réplicas afin de garantir une haute disponibilité en cas de crash machine.

Un réplica est simplement une copie d'un shard.
On distingue donc les shards primaires des réplicas.
Les shards primaires et les réplicas répondent aux recherches ce qui permet d'améliorer les performances.

Par contre, lors de l'indexation d'une nouvelle données, c'est le shard primaire qui récupère la requête d'indexation, index la donnée en locale et transfert la requête d'indexation aux réplicas. Chaque shard (primaire et réplicas) indexe la donnée.

En cas d'indexation concurrente de la même donnée (mise à jour de la donnée), il se peut que l'ordre d'indexation entre les shards ne soit pas le même. C'est pour cela qu'ElasticSearch propose de [versionner les documents indexés afin de détecter les incohérences](http://www.elasticsearch.org/blog/2011/02/08/versioning.html) pendant les mises à jour.


#### Perte d'un nœud

Si le shard primaire tombe, un [réplica sera choisi pour devenir le shard primaire](http://elasticsearch-users.115913.n3.nabble.com/How-does-a-recovering-node-validate-any-shard-information-data-during-recover-td3215028.html).

C'est le rôle du [timeout](http://www.elasticsearch.org/guide/reference/api/index_.html#Timeout) de faire patienter la requête pendant 1 minute le temps qu'un shard primaire soit accessible, et que les autres replicas soit présents ([réglable](http://www.elasticsearch.org/guide/reference/api/admin-indices-update-settings.html)).

Un nouveau réplica va être créé sur un autre nœud en faisant une copie des donnés du shard primaire, et ainsi le mécanisme d'indexation pourra reprendre son cours.


### Découverte des nœuds du cluster & nœud maître

La découverte des nœuds du cluster peut se faire à partir de plusieurs protocoles:

* [Zen](http://www.elasticsearch.org/guide/reference/modules/discovery/zen.html): Multicast ou Unicast
* [EC2](http://www.elasticsearch.org/guide/reference/modules/discovery/ec2.html)
* [ZooKeeper](https://github.com/sonian/elasticsearch-zookeeper)

ElasticSearch a besoin d'un nœud maître qui sera [le seul à prendre des décisions pour le cluster et qui maintiendra l'état du cluster](http://www.elasticsearch.org/guide/reference/modules/discovery/).

Au démarrage du cluster, il y a élection du nœud maître.
Si l'état du cluster a déjà été persisté par un local gateway (Cf redémarrage complet du cluster), le nœud maître [attend ou pas](http://www.elasticsearch.org/guide/reference/modules/gateway/) que l'ensemble des nœuds aient démarré afin de charger l'état du cluster le plus récent.

Tant que le nœud maître est vivant, il s'occupera d'assigner les shards dès qu'un nœud rejoint ou part du cluster. C'est le [nœud maître qui ping les autres nœuds](http://www.elasticsearch.org/guide/reference/modules/discovery/zen.html#Master Election) pour décider s'il les déclare vivants ou morts.

Sinon son rôle se limite à maintenir l'état du cluster et à informer les autres nœuds lorsque l'état change. Les autres nœuds connaissent donc l'état du cluster, ils n'ont pas besoin d'interroger le nœud maître à chaque requête. [Le nœud maître n'est pas un goulot d'étranglement](http://blog.sematext.com/2010/05/03/elastic-search-distributed-lucene/).

Un humain peut connaître l'état du cluster avec cette requête : <http://HOSTNAME:PORT/_cluster/state>

[Est retourné](http://www.elasticsearch.org/guide/reference/api/admin-cluster-state.html) :

* le nom du cluster
* le nœud maître
* la liste des actions bloquées
* les nœuds constituant le cluster
* le mapping des index
* l'allocation des shards

### Election du nœud maître

Lorsque le nœud maître tombe, ou lorsque le cluster démarre, il faut élire un nœud maître.
Sans nœud maître le cluster ne fonctionne pas.

Pendant l'élection chaque nœud connecté fait un vote, et [le broadcast à tout le monde](https://groups.google.com/forum/#!msg/elasticsearch/epdPQ7L9phM/p5xLPco7rX0J). Tous les nœuds reçoivent l'ensemble des résultats, le nœud ayant le plus de points devient le nœud maître.

Chaque nœud ping le nœud maître, et si le maître ne répond plus [pendant un certain temps](http://www.elasticsearch.org/guide/reference/modules/discovery/zen.html#Fault Detection), alors les nœuds recommencent le processus d'élection.

### ElasticSearch et le CAP

Chaque système distribué est régi par [le théorème du CAP](http://en.wikipedia.org/wiki/CAP_theorem).
Historiquement ce théorème simplifie les systèmes distribués afin de faire comprendre que parmi les 3 contraintes suivantes seulement 2 pourront être satisfaites : la cohérence des données, la disponibilité, la tolérance au partitionnement.

Par défaut ElasticSearch a choisi de privilégier la cohérence des données.

#### Sans partitionnement

Par défaut ElasticSearch attend avant de répondre à une requête d'indexation qu'[un certain nombre de réplicas](http://www.elasticsearch.org/guide/reference/api/index_.html#Write Consistency) aient indexé la donnée. C'est ce que l'on appelle une réplication synchrone.

Sans partitionnement ElasticSearch a donc choisi la cohérence des données au détriment de la latence.

Mais la réplication peut être [configurée en asynchrone afin de favoriser la latence](http://www.elasticsearch.org/guide/reference/api/index_.html#Asynchronous réplication)


#### Avec partionnement

Si un cluster ElasticSearch se retrouve divisé en deux, on subit un partitionnement ou split-brain.
Ce problème arrive lorsque les deux partitions n'arrivent plus à dialoguer entre elle (problème réseau par exemple).

Cependant, si ces deux partitions restent accessibles aux clients, il est possible qu'une donnée soit modifiée sur une partition, mais pas sur l'autre.
Les données entre les deux partitions ne sont plus cohérentes.

ElasticSearch ne possède pas de solution pour déterminer la bonne donnée de la mauvaise.
Lorsque les deux partitions vont de nouveaux dialoguer entre elle, il sera impossible pour ElasticSearch faire le choix entre les deux données.

Cette solution n'est pas acceptable. Il est donc possible de forcer le système à rester cohérent pendant un partitionnement quitte à [rendre une partition indisponible](https://github.com/elasticsearch/elasticsearch/issues/1079).

Nous pouvons dire à ElasticSearch d'arrêter les clusters ayant [moins de `zen.discovery.minimum_master_node` nœuds](https://github.com/elasticsearch/elasticsearch/issues/1079).


Nous nous retrouvons donc avec une moitié de cluster disponible.
Dans cette situation il se peut qu'un rebalancing soit en cours, les index n'auront pas encore tous leurs shards actifs.

ElasticSearch peut être configuré pour [bloquer l'indexation s'il manque des shards](http://www.elasticsearch.org/guide/reference/api/index_.html#Write Consistency), et ainsi garantir une cohérence des données au prix d'une indisponibilité.


## Prévenir et corriger les erreurs ElasticSearch

### Créer une sauvegarde du cluster ES

Il faut tout d'abord [désactiver le flush du Translog](http://www.elasticsearch.org/guide/reference/api/admin-indices-update-settings.html) afin de ne pas modifier les segments, puis ensuite faire [la copie du répertoire de données](https://groups.google.com/d/msg/elasticsearch/tB3m_RE85yM/PCcjaPYSDz0J) (qui contient les metadatas du cluster, et les index Lucene)

### Données ElasticSearch corrompues.

Il est possible de corrompre les données persistées par ElasticSearch (index Lucene, metadata du cluster, transaction log) à cause de [bugs](http://elasticsearch-users.115913.n3.nabble.com/corrupted-indexes-td3501368.html), [full disk](http://elasticsearch-users.115913.n3.nabble.com/corrupted-segment-td3860349.html), [coupure de courant pendant un commit](https://groups.google.com/d/msg/elasticsearch/HtgNeUJ5uao/H2KLhns2YkIJ), ...).

Il peut être préférable de stocker la donnée en dehors d'ElasticSearch afin de pouvoir tout réindexer en cas de problème. Sinon il existe des outils pour [réparer les index corrompus](http://elasticsearch-users.115913.n3.nabble.com/corrupted-segment-td3860349.html), et des techniques pour [corriger le Translog](https://groups.google.com/d/msg/elasticsearch/HtgNeUJ5uao/H2KLhns2YkIJ)

## A ne pas oublier pour la production

* [Interdire de supprimer tous les index](http://www.elasticsearch.org/guide/reference/api/admin-indices-delete-index.html)
* [Interdire d'arrêter un nœud](http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-shutdown.html)
* [Ne pas importer les index en suspens](https://github.com/elasticsearch/elasticsearch/issues/2067)

## Glossaire

<http://www.elasticsearch.org/guide/appendix/glossary.html>

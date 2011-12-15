---
layout: post
title: Créer une API REST
author: bclozel
tags: [rest, api]
published: true
---

Les APIs REST sont de plus en plus utilisées:

* avec les webservices dits "techniques" (à usage interne uniquement à
  une plate-forme), qui viennent simplifier l'utilisation de services
orientés SOAP.
* avec des APIs orientées "web UI", qui sont utilisées par des
  applications full javascript.
* pour des APIs orientées applications mobiles ou utilisation par une
  grande variété de développeurs tiers.

Le terme "API REST" est très conceptuel, voire polémique; les concepts
derrière REST ne sont pas suffisants pour répondre à tous vos besoins.
Cet article donne quelques pistes pour la conception et la mise en
oeuvre d'une API de ce type.

Pas besoin de lire [la thèse de Roy
Fielding](http://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm) ou
de suivre à la lettre tous les dogmes REST - mais quelques règles
simples ne sont pas à négliger.

## Règle #1: respecter les grands principes REST

    GET http://example.org/user/12

Une API REST doit avant tout servir à manipuler des **ressources** (ici,
un utilisateur) avec des verbes (ici, GET). Trop souvent, les
concepteurs d'API ont tendance à inclure des verbes dans les URIs.

L'API Flickr est un bon exemple de pièges à éviter; on retrouve dans les
URIs des noms de méthodes (en fait, cette API est plus proche de RPC que
de REST).

    GET http://api.flickr.com/services/rest/?method=flickr.photos.delete&api_key=aaabbbccc&photo_id=12 (API Flickr)
    DELETE http://api.flickr.com/photos/12?api_key=aaabbbccc (une idée d'amélioration)

Très souvent, éviter ce piège revient à créer de nouvelles ressources;
un exemple avec une API orientée e-commerce:

    GET http://example.org/order/144/pay (payer une commande existante)

En fait, créer une ressource "paiement" peut être une bonne idée, ce qui
permettra de vérifier le status de ce paiement plus tard.

    POST http://example.org/payment/?order=144 (création d'un paiement)
    GET http://example.org/payment/23 (renvoie les informations sur le paiement)

Des articles entiers traitent du [design
d'URLs](http://warpspire.com/posts/url-design/).

## Règle #2: laisser HTTP faire son travail

HTTP a déjà les fonctionnalités, il est omniprésent et déjà testé.
HTTP, c'est entre autres le content negiciation, le cache de ressources
et le versioning (via Etags ou Cache-control), des codes d'erreurs
explicites... pourquoi le réinventer?

Dans le doute, on pourra toujours revoir les [status
HTTP](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes) et les
[headers HTTP](http://en.wikipedia.org/wiki/List_of_HTTP_header_fields)
pour voir si HTTP est déjà équipé pour un besoin particulier.


## Règle #3: garder une architecture orientée web

Le web est essentiellement:

* stateless. Oubliez les sessions et la sauvegarde d'état entre 
différentes requêtes. Si vous voulez épargner votre base de données,
de nombreux systèmes de cache sont adaptés à ce besoin (redis,
memcached, ehcache...).
* oriénté ressources. L'important est de ne pas laisser des conventions
  de l'application venir polluer les interactions client/serveur. Cet
item n'est pas facile à qualifier; mais généralement, une API difficile
à documenter est un signe.


## Règle simple: commencer par comprendre les utilisateurs

Avant de commencer la conception des ressources et des URIs, il faut
tout d'abord qualifier ses utilisateurs (qui/quoi va utiliser cette
API?) et quels services nous souhaitons leur rendre.
Définir quelques priorités sur les items suivants permet de concentrer
ses efforts sur les aspects importants pour notre API:

![APIs REST](/public/img/2011-09-21-creer-une-api-rest/api-rest.png)

Ce schéma identifie des zones où répartir ses efforts, selon l'API REST
que l'on souhaite créer. Un exemple avec l'item "usage": si l'API doit
être intégrée dans des sites tiers, il est préférable de concentrer des
efforts sur l'utilisation de [JSONP](http://en.wikipedia.org/wiki/JSONP) ou [CORS](http://en.wikipedia.org/wiki/Cross-Origin_Resource_Sharing) afin d'éviter les limitations de sécurité des navigateurs web.

## Un dernier mot

Certains problèmes de conception sont récurrents dans les APIs REST, et
les opinions sont souvent bien trop tranchées.

### Le versioning revient souvent dans les préoccupations

* pour identifier différentes versions d'une API, l'utilisation d'un
  préfixe est [souvent
recommandé](http://stackoverflow.com/questions/389169/best-practices-for-api-versioning)
* lorsque la composition des ressources varie, l'utilisation du
  content-type HTTP personnalisé est la clé (par exemple: `Accept: application/vnd.pullrequest-v2+json`)
* pour le versioning de ressources (suivre les modifications d'une
  ressource particulière), l'utilisation des Etags (pour le cache) et/ou
d'un numéro de version dans votre ressource sont suffisants

### Documentation et "découvrabilité"

La documentation est un aspect essentiel d'une API REST. Certains
prennent le parti d'automatiser et d'outiller un maximum la
documentation: par exemple, avec [jax-doclets](http://www.lunatech-labs.com/open-source/jax-doclets).

Pour aller plus loin, les APIs peuvent apporter une "découvrabilité":
permettre au protocole HTTP de documenter l'utilisation de l'API. En
clair, donner au client REST des indications sur les actions possibles
via les headers réponse HTTP. Martin Fowler l'explique bien dans un
article sur le [Richardson Maturity
Model](http://martinfowler.com/articles/richardsonMaturityModel.html).

### En cas de doute...

Il est souvent utile de se référer à une API REST très
utilisée et reconnue: l'[API github](http://developer.github.com/) est considérée comme une des
meilleures à ce jour.

Aussi, je vous recommande la lecture des articles de Steve Klabnik:

* ["nobody understands REST or
  HTTP"](http://blog.steveklabnik.com/2011/07/03/nobody-understands-rest-or-http.html)
* ["some people understand REST and
  HTTP"](http://blog.steveklabnik.com/2011/08/07/some-people-understand-rest-and-http.html)


## Ressources utiles

* Tester son API REST depuis son navigateur avec une [extension Chrome](https://chrome.google.com/webstore/detail/cokgbflfommojglbmbpenpphppikmonn) ou
  avec CURL!
* Google a beaucoup travaillé sur les aspects RDF/atomPUB avec
  [Gdata](http://code.google.com/intl/fr-FR/apis/gdata/)
* Le projet Jersey a de [nombreux exemples d'APIs
  REST](http://download.java.net/maven/2/com/sun/jersey/samples/jersey-samples/)
sur des aspects particuliers, dont
[Hypermedia](http://download.java.net/maven/2/com/sun/jersey/experimental/hypermedia-action/hypermedia-action-sample/)
* Mettre en place un ["rate
  limiting"](http://stackoverflow.com/questions/667508/whats-a-good-rate-limiting-algorithm)
sur son API peut aussi bénéficier d'un cache distribué (memcached,
redis...)
* Selon la plate-forme cible, [le format
  JSON](http://jersey.java.net/nonav/documentation/latest/json.html#d4e955) peut être légèrement
  différent.


---
layout: post
title: Web Socket - Are you plugged ?
author: feugy
tags: [java, javascript, mythicforge, graniteds, jetty, JMS, STOMP, websocket]
---

Depuis à peu près deux ans, je réalise un [MMORPG](https://bitbucket.org/feugy/myth/wiki/Home) gratuit et OpenSource avec un serveur Java et deux clients Flex (un d'administration et un de jeu).

J'ai utilisé le merveilleux framework [GraniteDS](http://www.graniteds.org/confluence/pages/viewpage.action?pageId=229378) qui est un pont entre le java et flex, comme BlazeDS d'Adobe, avec plus de fonctionnalités encore.  
  
Malheureusement, j'ai surtout besoin de flexibilité coté client de jeu (tout le GameDesign est configurable via l'admin), et j'ai décidé finalement de tout réécrire en technologies Html 5/Css 3/Js.

Les 3 grandes fonctionnalités de GraniteDS qui doivent donc être remplacées sont les suivantes :

1.  L'invocation distante de méthodes Java, remplacée par une API REST. Chaque méthode du serveur est une url qui produit et consomme du XML ou du JSON. J'ai choisi [Jersey ](http://jersey.java.net/) pour cela (implémentation de référence de la spécification JAX-RS).
2.  Le MCV client "tide", remplacé par [RESTHub-js](https://bitbucket.org/ilabs/resthub-js/src).
3.  Le push serveur : les clients flex sont constamment connectés au serveur qui leur envoi les mises à jour déclenchées par les autres joueurs. Ce billet explique comment j'ai remplacé cette partie par l'utilisation des WebSockets.
 
## Alors, comment on joue ?

Les Web sockets sont juste... des sockets. C'est un canal connecté entre le navigateur et le serveur, ni plus, ni moins. Vous avez donc besoin d'un navigateur récent (Chrome, IE9 ou Firefox 4 correctement configuré) et d'un serveur.

Il y a quelques serveurs Java qui implémentent le protocole : jWebSocket, Kaazing, webbit... Mais aucun d'entre eux n'est aussi un conteneur de Servlet, la base de nos serveurs java. A l'exception de [Jetty](http://jetty.codehaus.org/jetty/).  

Sans rentrer dans les détails, Jetty est un serveur Http+Servlet+WebSocket très puissant écrit en java, qui peut être utilisé en mode embarqué ou standalone. Il implémente le brouillon de la norme Websocket depuis un petit moment, et [plutôt simplement](http://blogs.webtide.com/gregw/entry/jetty_websocket_server).

{% highlight java %}
public class WebSocketDummyServlet extends WebSocketServlet {

    /**
     * Invoked by Jetty during the handshake: Return a WebSocket object to allow 
     * the connection establishement.
     *
     * <em>@param request</em> Http upgrade request
     * <em>@return</em> The WebSocket Channel.
     */
    protected WebSocket doWebSocketConnect(HttpServletRequest request, String protocol) {
        return new DummyWebSocket();
    }

    /**
     * Websocket channel dummy implementation.
     */
    implements WebSocket {

        /**
         * Object that sends message to the connected client with method 
         * sendMessage(String message).
         *
         */
        Outbound _outbound;

        /**
         * Channel connexion.
         */
        public void onConnect(Outbound outbound) {
            _outbound=outbound;
        }

        /**
         * Invoked when the client sends a message.
         * <em>@param</em> <em>data </em>The sent data
         */
        public void onMessage(byte frame, String data){}

        /**
         * Channel disconnexion.
         */
        public void onDisconnect(){}
    }
}
{% endhighlight %}

Plutôt facile, non ? Cette servlet doit être déclarée dans le descripteur web.xml :

{% highlight xml %}
<servlet>
    </servlet-name>
    <servlet-class>org.dummy.WebSocketDummyServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>wsServlet</servlet-name>
    <url-pattern>/*</url-pattern>
</servlet-mapping>
{% endhighlight %}

Vous avez besoin d'envoyer des messages à tous les clients connectés ? Vous n'avez qu'à stocker les instances de  DummyWebSocket créées, et ajouter une méthode qui utilisera \_outbound.sendMessage().

## Je suis connecté ! Mais je peux rien faire...

Comme je le disais, vous n'avez qu'un tuyau connecté. Il transporte des chaînes de caractères et des bits. C'est efficace, mais pas vraiment utilisable en tant que tel.

Il est donc nécessaire d'implémenter un protocole au dessus de ce tuyau. Ce dernier dépendra de vos besoins. Une application de messagerie instantannée ? Utilisez XMPP. Une application de streaming ? Pourquoi pas RTP. Un jeu FPS ? créez  votre propre protocole.  
GraniteDS proposait un mécanisme de publication/souscription de POJO sérialisés, proche de JMS. Heureusement, il existe un équivalent parfait : [STOMP](http://stomp.codehaus.org/Protocol).

Une minute ! Google donne quelques résultats pour "STOMP Websocket Java". Notamment ActiveMQ, RabittMQ et HornetMQ, fameux brokers JMS. Utilisons-les. Enfin non : c'est vraiment de l'overkill : je n'avais pas besoin de toute cette mécanique complexe...

Alors j'ai implémenté le protocole STOMP (sans la gestion transactionnelle) et ça m'a pris deux jours. En fait, STOMP est vraiment très simple (tout est en texte, et les sauts de lignes sont significatifs) :

**client X, client Y :**

    CONNECT
    login: X <or> Y
    passcode: <passcode>

    ^@

**client Y:**

    SUBSCRIBE
    destination: /topic-1
    ack: client

    ^@

**client X:**

    SEND
    destination: /topic-1

    hello everyone !
    ^@

**et le client Y reçoit:**

    MESSAGE
    destination:/topic-1
    message-id: <message-identifier>

    hello everyone !
    ^@

## Et coté client justement ?

Le client en javascript est vraiment simple :

{% highlight javascript %}
    var location = document.location.toString().replace('http:','ws:');
    this._ws=new WebSocket(location);
    this._ws.onopen=this._onopen;
    this._ws.onmessage=this._onmessage;
    this._ws.onclose=this._onclose;

    _onopen: function(){
    },

    _send: function(message){
      this._ws.send(message);
    },

    _onmessage: function(message) {}
{% endhighlight %}

Je n'ai pas encore choisi d'implémentation STOMP coté client et dès que je l'aurai fait, je mettrai cet article à jour.  

Juste un avertissement : nous l'avons testé à travers des proxies, et ça fonctionne très bien.  
Pas de déconnexion intempestives, pas de ralentissements.  
Mais cela nécessite que le client envoie un keep-alive à travers le socket. Le serveur n'a pas besoin de répondre.  

Un message de keep-alive toutes les 10 secondes marche bien, mais j'imagine que cela dépend des configurations des proxies et firewall traversés.

## J'adore ! Où est le code ?

Actuellement, il est accessible sur bitbucket (licencié en LGPL-3):

*   [Les objets Jetty](https://bitbucket.org/feugy/myth/src/1a56ca416b5a/chronos-webapp/src/main/java/org/mythicforge/tools/websocket/) et leurs tests unitaires
*   [L'implémentation Stomp](https://bitbucket.org/feugy/myth/src/1a56ca416b5a/chronos-webapp/src/main/java/org/mythicforge/tools/stomp/) et ses [tests unitaires](https://bitbucket.org/feugy/myth/src/1a56ca416b5a/chronos-webapp/src/test/java/org/mythicforge/tools/stomp/)
*   Le client [Java websocket](https://bitbucket.org/feugy/myth/src/1a56ca416b5a/chronos-webapp/src/test/java/org/mythicforge/tools/) (classes WebSocketClient, IMessageReceiver, StompWebSocketListener)

Vous l'avez deviné, je suis un fanatique du TDD. J'ai donc réalisé un client Websocket en Java. En effet mes tests unitaires lancent le serveur dans un Jetty en mémoire et agissent comme s'ils étaient des navigateurs.

Dès que je serai un peu plus disponible, je packagerai l'ensemble indépendamment de mon moteur de jeu, et je le reverserai à [RESThub-js](https://bitbucket.org/ilabs/resthub-js/). 
En effet, il y a très peu de dépendances entre les deux, et je pense que cela peut être réutilisé dans d'autres contextes... Peut-être par vous :)  

---
layout: post
title: Les subtilités des formulaires de login en JS
author: feugy
tags: [javascript, login, formulaire, chrome, firefox, jQuery]
published: true
---

Quoi de plus simple qu'un formulaire de login ? 
En HTML, certes, mais lorsque qu'on parle d'application riche en javascript, c'est une autre histoire.

Si vous ne comprenez pas pourquoi le navigateur ne retient pas vos logins, ne propose pas le mot de passe associé, ou ne réagit pas à la touche entrée, lisez la suite !

Cet article est le résultat de **l'étude empirique du comportement des navigateurs**. 
Il est donc sujet à caution: tout dépends de votre navigateur et de sa version.
J'espère simplement vous aider à comprendre et éviter les principaux chausse-trappes, sans avoir recours à l'installation d'un plugin :)


## Mais ce n'est qu'un formulaire !

Hélas non... Les formulaires de login (un champs <tt>text</tt> + un champ <tt>password</tt>) sont détectés par le navigateur, qui va les traiter différemment des autres champs textuels.

C'est là le premier problème :
>**Le formulaire doit être présent dans le DOM au chargement de la page.**

Oui, vous avez compris : si vous construisez votre formulaire directement en JS, ou si vous utilisez un template que vous accrochez une fois la page chargée, votre formulaire sera ignoré par certains navigateurs.

L'astuce que j'utilise consiste à:

* inclure le formulaire de login dans ma page index.html
* le masquer avec un style CSS <tt>display:none</tt>.
* le déplacer par la suite en javascript là où il doit apparaitre dans le rendu 

**index.html**

{% highlight html %}
<div id="loginStock" style="display:none">
    <form id="formLogin">
        <input type="text" name="username"/>
        <input type="password" name="password"/>
    </form>
</div>
{% endhighlight %}

**login.js**

{% highlight js %}
$('.loginContainer', this.element).append($('#loginStock > *'));
{% endhighlight %}

## Dois-je mettre un champ de type <tt>submit</tt> ?

S'il n'y a que les champs de type <tt>text</tt> et <tt>password</tt>, le navigateur ne retiendra pas le mot de passe.

>**Le champ de type <tt>submit</tt> est indispensable.** 

Même s'il est masqué (le bouton n'est pas encore bien skinnable, même en CSS 3), il doit être présent.

**index.html**

{% highlight html %}
<div id="loginStock" style="display:none">
    <form id="formLogin">
        <input type="text" name="username"/>
        <input type="password" name="password"/>
        <input type="submit" style="display:none"/>
    </form>
    <a href="#" class="submit"></a>
</div>
{% endhighlight %}

**login.js**

{% highlight js %}
$('.loginContainer .submit').click(function(event){
    // Déclenche la soumission du formulaire.
    $('#formLogin').submit();
    // Annule la propagation du Click sur le lien, pas de la soumission du formulaire !
    return false;
}).button({label:'log in !'});
{% endhighlight %}

## Doit-on stopper la propagation de l'événement <tt>submit</tt> ?

Le problème se pose si vous ne réalisez pas un "vrai" POST lorsque l'utilisateur déclenche la soumission du formulaire.
Dans la majorité des applications riches, l'authentification se fait via une API, et donc un appel Ajax.

On se branche alors sur l'événement submit, et on annule sa propagation.

Seulement, en stoppant l'événement de soumission, le navigateur ne retient pas le login et le mot de passe.

>**Pour que le navigateur mémorise le couple login/mot de passe, l'événement <tt>submit</tt> doit se propager.**

Cela implique:

* que le formulaire pointe sur une véritable url, sinon, une vilaine 404 apparaitra dans votre console
* que le résultat de la soumission soit routée dans une iframe (désolé pour les puristes :)), sans quoi, toute la page se rechargera

Donc généralement, mon service web propose une API POST qui ne fait rien et renvoie une page vide, et j'utilise une iframe masquée.

>**Edit**
Les dernières versions de Chrome (15+) impose une nouvelle contrainte : il faut que le retour du serveur soit non vide.
Donc votre "fausse API" POST doit renvoyer quelque chose (y compris une chaîne vide), mais en aucun cas un code HTTP 204 (OK BUT NO CONTENT)

**index.html**

{% highlight html %}
<div id="loginStock" style="display:none" method="post" action="/api/login/noop" target="postFrame">
    <form id="formLogin">
        <input autofocus="autofocus" type="text" name="username"/>
        <input autocomplete="on" type="password" name="password"/>
        <input type="submit" style="display:none"/>
    </form>
    <a href="#" class="submit"></a>
</div>
<iframe name="postFrame" class="hidden"></iframe>
{% endhighlight %}

**login.js**

{% highlight js %}
$('#formLogin').submit(function(event){
    // Ici mon appel ajax, et surtout, ne pas renvoyer false ni invoquer event.stopPropagation().
});
{% endhighlight %}

### Une petite astuce : lorsque l'authentification échoue.

A partir du moment où l'événement <tt>submit</tt> est propagé, et qu'une réponse HTTP est reçue, le navigateur conservera bien le mot de passe et le login.

Mais nous pouvons tirer parti de ce comportement, lorsque l'authentification échoue, par exemple si l'utilisateur est inconnu, ou le mot de passe erroné.

Ainsi, mon appel Ajax est toujours **synchrone** (parfois ça sert !), et s'il échoue, alors dans ce cas, j'annule la propagation de l'événement <tt>submit</tt> pour ne pas conserver les mauvais identifiants.



## La touche entrée ne soumet pas toujours mon formulaire...

Hélas oui, c'est un comportement étrange de certains navigateurs : un formulaire sera automatiquement soumit si on appuie sur entrée dans un de ses champs, sauf si le bouton submit est invisible ! 

Donc il faut eviter le <tt>display:none</tt> ou le <tt>visibility:hidden</tt> sur le champ. 
Personnellement, je lui affecte une taille de zéro. Vous pouvez aussi le positionner en absolu, en dehors de la zone visible, ou le mettre en dessous d'un autre élément avec le <tt>z-index</tt>

**index.html**

{% highlight html %}
<div id="loginStock" style="display:none" method="post" action="/api/login/noop" target="postFrame">
    <form id="formLogin">
        <input autofocus="autofocus" type="text" name="username"/>
        <input autocomplete="on" type="password" name="password"/>
        <input type="submit" style="width:0; height:0; border:0; padding:0"/>
    </form>
    <a href="#" class="submit"></a>
</div>
{% endhighlight %}

## Conclusion

Vous voyez ? quand je vous disais que ce n'était pas trivial...

Mais maintenant, vous avez toutes les clefs pour faire des formulaires qui exploitent le cache de login/mot de passe des navigateurs.

Espérons que dans un futur proche, les navigateurs harmonisent un peu plus leur fonctionnement, de manière à éviter tout ces tricks...

Damien.

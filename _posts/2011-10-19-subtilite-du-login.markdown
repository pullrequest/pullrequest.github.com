---
layout: post
title: Les subtilité des formulaire de login en JS
author: feugy
tags: [javascript, login, formulaire, chrome, firefox, jQuery]
published: false
---

Quoi de plus simple qu'un formulaire de login ? 
En HTML, certes, mais lorsque qu'on parle d'application riche en javascript, c'est une autre histoire.

Si vous ne comprenez pas pourquoi le navigateur ne retient pas vos logins, ne propose pas le mot de passe associé, ou ne réagit pas à la touche entrée, lisez la suite !

Cet article est le résultat de **l'étude empirique du comportement des navigateurs**. 
Il est donc sujet à caution: tout dépends de votre navigateur, et de sa version.
J'espère simplement vous aider à comprendre et éviter les principaux chausse-trappes, sans avoir recours à l'installation d'un plugin :)


## Mais ce n'est qu'un formulaire !

Hélas non... Les formulaire de login (un champs <tt>text</tt> + un champ <tt>password</tt>) sont détecté par le navigateur, qui va traiter différemment des autres champs textuels.

C'est là le premier problème :
>**Le formulaire doit être présent dans le DOM au chargement de la page.**
 
Oui, vous avez compris : si vous construisez votre formulaire directement en JS, ou si vous utilisez un template que vous accrochez une fois la page chargée, votre formulaire ne sera ignorés par certains navigateurs.

L'astuce que j'utilise consiste a :

* inclure le formulaire de login dans ma page index.html
* le masquer avec un style CSS <tt>display:none</tt>.
* le déplacer par la suite en javascript là où il doit apparaitre dans le rendu 

**index.html**

    <div id="loginStock" style="display:none">
    	<form id="formLogin">
    		<input type="text" name="username"/>
    		<input type="password" name="password"/>
    	</form>
    </div>

**login.js**

    $('.loginContainer', this.element).append($('#loginStock > *'));
	
	
## Dois-je mettre un champ de type <tt>submit</tt> ?

S'il n'y a que les champs de type <tt>text</tt> et <tt>password</tt>, le navigateur ne retiendra pas le mot de passe.

>**Le champ de type <tt>submit</tt> est indispensable.** 

Même s'il est masqué (le bouton n'est pas encore bien skinnable, même en CSS 3), il doit être présent.

**index.html**

    <div id="loginStock" style="display:none">
    	<form id="formLogin">
    		<input type="text" name="username"/>
    		<input type="password" name="password"/>
			<input type="submit" style="display:none"/>
    	</form>
        <a href="#" class="submit"></a>
    </div>
	
**login.js**

    $('.loginContainer .submit').click(function(event){
        // Déclenche la soumission du formulaire.
        $('#formLogin').submit();
		// Annule la propagation du Click sur le lien, pas de la soumission du formulaire !
		return false;
    }).button({label:'log in !'});

	
## Doit-on stopper la propagation de l'évènement <tt>submit</tt> ?

Le problème se pose si vous ne réalisez pas de "vrai" POST lorsque l'utilisateur déclenche la soumission du formulaire.
Dans la majorité des applications riches, l'authentification se fait via une Api, et donc un appel Ajax.

On se branche alors sur l'évènement submit, et on annule sa propagation. Par exemple :

Seulement, en stoppant l'évènement de soumission, le navigateur ne retient pas le login et le mot de passe.

>**Pour que le navigateur mémorise le couple login/mot de passe, l'évènement <tt>submit</tt> doit se propager.**

Cela implique:

* Que le formulaire pointe sur une véritable url, sinon, une vilaine 404 apparaitra dans votre console
* Que le résultat de la soumission est routée dans une iframe (désolé pour les puristes :)), sans quoi, toute la page se rechargera

Donc généralement, mon service web propose une Api POST qui ne fait rien et renvoi une page vide, et j'utilise une iframe masquée.

**index.html**

    <div id="loginStock" style="display:none" method="post" action="/api/login/noop" target="postFrame">
    	<form id="formLogin">
    		<input autofocus="autofocus" type="text" name="username"/>
    		<input autocomplete="on" type="password" name="password"/>
			<input type="submit" style="display:none"/>
    	</form>
		<a href="#" class="submit"></a>
    </div>
	<iframe name="postFrame" class="hidden"></iframe>
	
**login.js**

    $('#formLogin').submit(function(event){
        // Ici mon appel ajax, et surtout, ne pas renvoyer false ni n'invoquer event.stopPropagation().
    });
	
	
### Une petite astuce : lorsque l'authentification échoue.

A partir du moment où l'évènement <tt>submit</tt> est propagé, et qu'une réponse HTTP est reçue, le navigateur conservera bien le mot de passe et le login.

Mais nous pouvons tirer parti de se comportement, lorsque l'authentification échoue, par exemple si l'utilisateur est inconnu, ou le mot de passe erroné.

Ainsi, mon appel Ajax est toujours **synchrone** (parfois ça sert !), et s'il échoue, alors dans ce cas, j'annule la propagation de l'évènement <tt>submit</tt> pour ne pas conserver les mauvais identifiants.



## La touche entrée ne soumet pas toujours mon formulaire...

Hélas oui, c'est un comportement étrange de certains navigateurs : un formulaire sera automatiquement soumit si on appuie sur entrée dans un de ses champs, sauf s'il à plus d'un champ <tt>text</tt>/<tt>password</tt>! 

Nous n'avons donc pas d'autres choix que de gérer nous même en javascript la touche entrée :

**login.js**

    $('#formLogin input').keyup(function(event){
		if (event.which == '13' && !event.metaKey) {
			$('#formLogin').submit();
			// Annule la propagation de l'évènement clavier, pour ne pas soumettre 2 fois le formulaire sur les navigateurs qui supportent correctement la feature.
			return false;
		}    
	});
	
	
## Conclusion

Vous voyez ? quand je vous disais que ce n'était pas trivial...

Mais maintenant, vous avez toutes les clefs pour faire des formulaires qui exploitent le cache de login/mot de passe des navigateurs.

Espérons que dans un futur proche, les navigateurs harmonisent un peu plus leur fonctionnement, de manière à éviter tout ces tricks...

Damien.
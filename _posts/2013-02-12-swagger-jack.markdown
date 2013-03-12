---
layout: post
title: "Swagger-jack: unleash your API"
tags: [swagger, api, validation, nodejs, express, descriptor]
author: feugy
published: true
---

Perhaps did you already heard about [Swagger](http://developers.helloreverb.com/swagger/). And if not, I can only beg you to check it out.

Swagger is a specification and complete framework implementation for describing, producing, consuming, and visualizing RESTful web services.

It provides:
- specification: how to write descriptors for your API
- tools: based on these descriptors: friendly GUI for documentation, client libraries...

**Swagger-jack** is one of these tools: a couple of [Express](http://expressjs.com/) middelwares (the famous [NodeJS](http://nodejs.org/) Web framework) to generate your own API, and take advantage of automated input validation.

You'll find the source code on [github](https://github.com/feugy/swagger-jack), and the project was released on [NPM](https://npmjs.org/package/swagger-jack)

<br/>
## What is swagger

Whether you're building huge information systems or providing a single (but powerful) REST web service, describing your API will give a better knowledge and therefore usage of your service. And If you can benefit from a well-known standard and its tooling suite... It's icing on the cake.

![swagger-ui example](http://helloreverb.com/img/swagger-hero.png)

Swagger is mainly a specification. You'll find it on [github](https://github.com/wordnik/swagger-core/wiki/Resource-Listing).

In respect of the REST conventions your API will expose **resources**.
A resource is one of your application concepts, and is bound to a path (the root of an url).

{% highlight json %}
{
  "apiVersion": "2.0",
  "basePath": "http://in.api.smartdata.io",
  "apis": [{
    "path": "/api-docs.json/source"
  },{
    "path": "/api-docs.json/stream"
  },{
    "path": "/api-docs.json/preprocessor"
  }]
}
{% endhighlight %}

The entry point of your descriptor (available at `/api-docs.json`) is therefore a list of resources and their paths.
You've certainly noticed that the format used is JSON ;). 
Each resource leads to a detailed descriptor (available at `/api-docs.json/resource-name`)

{% highlight json %}
{
  "apiVersion": "2.0",
  "basePath": "http://in.api.smartdata.io",
  "apis": [{
    "path": "/source",
    "operations": [{
      "httpMethod": "GET",
      "nickname": "list",
      "summary": "list the sources with pagination",
      "responseClass": "SourceResults",
      "parameters": [{
        "name": "from", 
        "description": "offset results will start from",
        "dataType": "int",
        "paramType": "query"
      },{
        "name": "size",
        "description": "number of results returned",
        "dataType": "int",
        "paramType": "query"
      },{
        "name": "query",
        "description": "find sources matching a query",
        "dataType": "string",
        "paramType": "query"
      }]
    }]
  },{
    "path": "/source/{id}",
    "operations": [...]
  },{
    "path": "/source/{id}/fields",
    "operations": [...]
  },{
    "path": "/source/{id}/mapping-preview",
    "operations": [...]
  }]
}
{% endhighlight %}

For a given resource, a detailed descriptor will give a list of **api**.
An api is simply a sub-path associated with a list of **operations**.
An operation is an HTTP verb for this sub-path, a set of awaited parameters and an expected model for the response.

At last, the detailed descriptor will embed a list of **models**.
A model is a formal description of a complex object, that can be used in input parameters and output response body.

{% highlight json %}
"models": {
  "Source": {
  "id": "Source",
  "properties": {
    "_id": {
      "type": "string",
      "description": "source identifier of 24 characters"
    },"created": {
      "type": "string",
      "description": "creation date (format ISO8601)"
    }, "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "used to store custom informations. Only string values are allowed."
    },"preprocessors": {
      "type": "array",
      "description": "There are a lot of preprocessors, and each preprocessor describe itself.",
      "items": {
        "$ref": "SourcePreProcessor"
      }
    }
  }
}
{% endhighlight %}

Models are described in [json-schema](http://json-schema.org/), an emerging (and already well known) standard to describe the expected content of a complex JSON object.

<br/>
To sum up, each urls of your REST web service will be grouped within operations (same url, different http methods), organized in apis (all sub-path of a base url) and resources (your application is a list of resources)

<br/>
## The swagger-jack library: why and how

We heavily use NodeJS in our project, and Express is the most popular web framework in the community. 
It's principle is quite simple: you declare your routes (an URL and an http method) and associate each of them to a function with specific arguments.
Second concept: middleware. 
A middleware is a function that behave like Java filters: it's invoked for each incoming request and can process it, enrich it and let other process it, or just ignore it.

We wanted to use swagger on existing web services, and enforce the input validation. 
We had a look to swagger-node-express the official nodejs plugin provided, but it involved too many code changes, and it does not provide validation.
And that's how swagger-jack was born.

It provides three middlewares, which you can enable or not.

{% highlight json %}
  var express = require('express'),
      swagger = require('swagger');

  var app = express();
  
  app.use(express.bodyParser())
    .use(express.methodOverride())
    .use(swagger.generator(app, {
      // general descriptor part
      apiVersion: '2.0',
      basePath: 'http://my-hostname.com/api'
    }, [{
      // descriptor of a given resource
      api: {
        resourcePath: '/user'
        apis: [{
          path: '/api/user/'
          operations: [{
            httpMethod: 'POST',
            nickname: 'create'
          }, {
            httpMethod: 'GET',
            nickname: 'list'
          }]
        }]
      },
      // controller for this resource
      controller:
        create: function(req, res, next) {
          // create a new user...
        },
        list: function(req, res, next) {
          // list existing users...
        }
    }])
    .use(swagger.validator(app))
    .use(swagger.errorHandler())

  app.get "/api/unvalidated", function(req, res, next) {
    // not documented nor validated
  }
  app.listen(8080);
{% endhighlight %}

### Generator middleware

Generator takes a general descriptor path (which is totally not constraint: put whatever you need in it), and an array of "resources".

The middleware will automatically register in your Express application the routes found in the descriptor, and bind them to the provided controller (it uses the `nickname` attribute to reach your function). In this example, two routes are created:

1. `POST /api/user/` to create a user (controller method `create()`)
2. `GET /api/user/` to list existing users (controller method `list()`)

You can still register routes and middleware within your application, but they will not be documented nor validated. 

### Validator middleware

Validator will analyze the declared parameters of your descriptor, and validate the input.
It will handle parameter casting, range validation and declared model compliance (thank to the excellent [json-gate](https://github.com/oferei/json-gate)).

All casted values (except body parameters) are available in the controller methods with the `req.input` associative array.
No matter if a parameter is from path, query or header: it will be present inside `req.input`.

But you can still use the Express original function (beware: values are just strings).

Body is just validated, as it was already parsed into json by the `express.bodyParser` middleware.

If you do not need validation, no problem: just remove the validator middleware.

### Error middleware

Validation errors (and your custom business errors) are handled by the error middleware.
It uses the Express's error management mechanism: invoke the next() method with an argument.

Wether it's a string or an object, it will be serialized into a json response with an http status (500 by default).

For example:

{% highlight json %}
  .use(swagger.generator(app, 
      { // general descriptor ... }
      [{
        api: // resource descriptor...
        controller: {
          create: function(req, res, next) {
            if (// error check...) {
              var err = new Error('forbidden !');
              err.status = 403;
              return next(err);
            }
            // process ...
          }
        }
      }])
{% endhighlight %}

Input validation errors are reported the same way.

You may not use the error middleware and provide your own.

### Last Power-tip !

Use [js-yaml](http://nodeca.github.com/js-yaml/) to store your descriptor in a separate file, and split your code into other controller modules:

{% highlight json %}
  var express = require('express'),
      swagger = require('swagger'),
      yaml = require('js-yaml');

  var app = express();
  
  app.use(express.bodyParser())
    .use(express.methodOverride())
    .use(swagger.generator(app, 
      require('/api/general.yml'), 
      [{
        api: require('/api/users.yml'),
        controller: require('/controller/users')
      },{
        api: require('/api/commands.yml'),
        controller: require('/controller/commands')
      }])
    .use(swagger.validator(app))
    .use(swagger.errorHandler())

  app.listen(8080);
{% endhighlight %}

<br/>
## In conclusion

Swagger-jack enpowered your NodeJS application with Swagger compliant API descriptor.

It brings you better lisibility: first you describe things (even in a separate file thanks to js-yaml), then you implement them.

It respects your own code organization: whether to use a huge file or one file per url is your choice.

It helps you secure your code: syntax validation (parameter existence, type, occurence, allowed value) is automatically done based on your descriptor.
Even the head-crusher body validation, for POST and PUT requests. Thanks to json-schema, it became as easy as pie.
You can then focus on semantic and business validation.

At last, it opens you the doors to the swagger's galaxy: documentation generator, automatic requesters, client library generators...

So, have fun with swagger and swagger-jack !

--------
### Addendum: what's with that name ?

We looked for a fun and yet eloquent name. But swagger.js was already used.
[Jack Swagger](http://www.wwe.com/superstars/jackswagger) is an american catch superstar, and we never heard about him before, but it perfectly fits our naming goals :)

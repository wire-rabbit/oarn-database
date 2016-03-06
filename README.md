# oarn-database
The Oregon Association of Relief Nurseries Database

# Overview
The Oregon Association of Relief Nurseries (OARN) is a community of nonprofits providing services to vulnerable families with young children. This project is an attempt to provide a single, shared database that can address a large subset of the community's common needs.

The database provides role based access (read-only, read-write, and admin) to each organization's data through a REST API, with a JavaScript based front-end. Migration tools for importing data from a set of spreadsheets are also included. The back-end uses Django's ORM and so should be largely database agnostic. Wherever possible, the model follows [CEDS guidelines](https://ceds.ed.gov/).

For more information about OARN, please see:  [http://www.oregonreliefnurseries.org/](http://www.oregonreliefnurseries.org/)

# Requirements
The user interface relies on [Enyo 2.5.1](https://enyojs.com/) and makes use of:
* [jQuery](https://jquery.com/)
* [Defiant.js](http://defiantjs.com/)
* [Moment.js](http://momentjs.com/)
* [Bootstrap-Grid-Only](https://github.com/zirafa/bootstrap-grid-only)

All database requests are sent to a [Django Rest Framework](http://www.django-rest-framework.org/) API, using [Djoser](https://github.com/sunscrapers/djoser) for token-based authentication.

# Deployment
Enyo should be placed in the UI folder. Then, rather than using the standard Enyo deployment script, run oarndeploy.sh. This script includes the usual deployment steps, but also copies the minified assets to the Django static resource folders. After that, the Django app may deployed to the server.

*This project was developed by Jeremy Bensman for [Family Building Blocks](http://familybuildingblocks.org) and is now maintained by [Wire Rabbit LLC](http://wirerabbit.com).*

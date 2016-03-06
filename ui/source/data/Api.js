//  The OARN Relief Nursery Database
//  Copyright (C) 2015  Oregon Association of Relief Nurseries
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Affero General Public License as
//  published by the Free Software Foundation, either version 3 of the
//  License, or (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Affero General Public License for more details.
//
//  You should have received a copy of the GNU Affero General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

(function(enyo,scope) {

    /**
     *
     * {@link oarn.API} is an object defining an ajax call to the server API with reasonable
     * defaults.
     *
     * Each component should include a property of type {@link oarn.API}. The main view will  then
     * be able to handle authentication and bind its own token to its child components which,
     * if needed, can then bind their instances of oarn.API to their children.
     *
     * To actually make a call to the API:
     *      <pre><code>
     *      var ajax = this.api.getAjaxObject('api/v1/ref/states');
     *      ajax.go();
     *      ajax.response(enyo.bindSafely(this, 'processResponse'));
     *      ajax.error(enyo.bindSafely(this, 'processError'));
     *      </code></pre>
     * And...
     *      <pre><code>
     *      processResponse: function(inRequest, inResponse) {
     *          this.collection = new enyo.Collection();
     *          this.collection.add(inResponse); // The response will be parsed automatically
     *          // If an object is returned rather than a collection,
     *          // the parsed data for element 'foo' will be in: inResponse.foo
     *      }
     *      processError: function(inRequest, inResponse) {
     *          // logging, alerts, etc.
     *      }
     *      </code></pre>
     *
     * If you're setting the <code>postBody</code>, this is the basic format:
     * 		<pre><code>
     *      ajax.method = "POST";
     *      var creds = {
     *          "password": "secret",
     *          "username": "demo"
     *      };
     *      ajax.postBody = creds;
     * 		</code></pre>
     *
     * @class oarn.API
     * @extends enyo.Object
     * @public
     */
    enyo.kind(
        /** @lends  oarn.API.prototype */{

        name: 'oarn.API',
        kind: 'enyo.Object',

        /**
         * If true, appends a random bit of data to the query string to prevent a cached value
         * from being returned.
         *
         * @type {Boolean}
         * @default true
         * @public
         */
        cacheBust: false,

        /**
         * The base of the url common to all endpoints, to which an endpoint is affixed when
         * calling <code>getAjaxObject()</code>.
         *
         * @type {String}
         * @default "http://localhost:8000/"
         * @public
         */
        urlRoot: 'http://localhost:8000/',  //testing

        /**
         * Sets the expected content type, which is JSON by default.
         *
         * @type {String}
         * @default "application/json; charset:utf-8"
         * @public
         */
        contentType: 'application/json; charset:utf-8',

        /**
         * The authorization token. Will only be added to headers if not null.
         *
         * @type {String}
         * @default null
         * @public
         */
        token: null,

        /**
         * Sets the HTTP request method, which defaults to GET.
         *
         * @type {String}
         * @default "GET"
         * @public
         */
        method: 'GET',

        /**
         * Sets the data sent with a POST request. It expects a simple JS object, e.g.:
         * <pre><code>
         * var creds = {
         *      "password": "secret",
         *      "username": "demo"
         *  };
         *  </code></pre>
         *
         * @type {Object}
         * @default null
         * @public
         */
        postBody: null,

        /**
         * @private
         */
        source: 'APISource',

        /**
         * Defines additional headers to be sent with the request. By default it includes the
         * CSRF token (provided by the Django back-end in a cookie) and the accept header to
         * specify JSON.
         *
         * @type {Object}
         * @public
         */
        headers: {
            'X-CSRFToken': enyo.getCookie('csrftoken'),
            'accept': 'application/json'
        },

        /**
         * Returns an <a href="http://enyojs.com/docs/latest/#/kind/enyo.Ajax">enyo.Ajax</a>
         * object set up make calls to the back-end API.
         *
         * @param {string} endpoint - The endpoint's URL following <code>urlRoot</code>.
         * @returns {enyo.Ajax}
         * @public
         */
        getAjaxObject: function (endpoint) {
            var apicall = new enyo.Ajax();
            apicall.cacheBust = this.cacheBust;
            apicall.url = this.urlRoot + endpoint;
            apicall.method = this.method;
            apicall.postBody = this.postBody;
            apicall.method = this.method;
            apicall.headers = this.headers;
            apicall.contentType = this.contentType;
            // Add a token to the headers if available:
            if (this.get('token') != null) {
                apicall.headers['Authorization'] = 'Token ' + this.get('token');
            }

            return apicall;
        }
    });

    new enyo.AjaxSource({name: 'APISource'});

})(enyo, this);